const Survey = require('../models/survey')
const Admin = require('../models/admin')
const SurveyQuestion = require('../models/surveyQuestion')
const Database = require('./database')

module.exports = class SurveyDAO {
  /**
   * Returns a list of surveys.
   * NOTE this will only return survey metadata (like title createdOn etc) if you also want the questions and the madeBy call getSurveyBydId
   * @function
   * @returns {SurveyQuestion[]} - Array of Surveys without questions
   */
  static async getAllSurveysMetaData () {
    const activeSurveysQueryResult = await Database.executeSQLStatement(
      'SELECT * FROM questionlist WHERE isactive = true'
    )

    const surveyList = []
    // the two undefined fields are madeBy and questions.
    //  - Don't query for all the questions for a given survey since that takes to long (is tested)
    //  - Don't set madeBy since I know where this function will be used will not use madeBy
    // This is also documented in the JSDoc
    activeSurveysQueryResult.rows.forEach((row) => {
      surveyList.push(SurveyDAO._surveyDatabaseRowToModel(row, undefined, undefined))
    })

    return surveyList
  }

  /**
   * Gets a specific survey by id.
   * @function
   * @param {number} surveyId - ID of the survey to get from the database.
   * @returns {Survey} - Returns the requested question list model.
   */
  static async getSurveyById (surveyId) {
    const surveyQueryResult = await Database.executeSQLStatement(
      'SELECT * FROM questionlist WHERE questionlistid=$1::integer', surveyId
    )

    if (surveyQueryResult.rowCount > 0) {
      const row = surveyQueryResult.rows[0]

      const questions = []

      const adminUserDb = await Database.executeSQLStatement(
        'SELECT userid, username FROM "User" WHERE userid = (SELECT userid FROM adminuser WHERE adminuserid=$1::integer LIMIT 1);',
        row.madebyadmin
      )

      let adminUser = null

      if (adminUserDb.rowCount > 0) {
        adminUser = adminUserDb.rows[0]
        adminUser = new Admin(adminUser.userid, adminUser.username, true)
      }

      const questionsQueryResult = await Database.executeSQLStatement(
        'SELECT * FROM question WHERE questionidlistid=$1::integer',
        surveyId
      )

      questionsQueryResult.rows.forEach((questionRow) => {
        questions.push(SurveyDAO._surveyQuestionDatabaseRowToModel(questionRow))
      })

      return SurveyDAO._surveyDatabaseRowToModel(row, adminUser, questions)
    }

    return undefined
  }

  /**
   * Update a existing survey with edits made by admin
   * @param {Number} existingSurveyId - Id from the not updated survey.
   * @param {Survey} updatedSurveyModel - Survey that is updated.
   * @returns {Survey} - Updated survey as a queryResult.
   */
  static async updateSurvey (existingSurveyId, updatedSurveyModel) {
    const updateQueryResult = await Database.executeSQLStatement(
      'UPDATE questionlist SET isactive=false WHERE questionlistid=$1::integer',
      existingSurveyId
    )
    const newInsertQueryResult = await this.saveSurvey(updatedSurveyModel)

    return updateQueryResult.rowCount > 0 && newInsertQueryResult
  }

  /**
   * Saves a survey to the database
   * @function
   * @param {Survey} surveyToSave - Needs to be of questionlist model.
   * @returns {boolean} - wheather it was saved or not.
   */
  static async saveSurvey (surveyToSave) {
    const saveQueryResult = await Database.executeSQLStatement(
      'INSERT INTO questionlist(title, madebyadmin, isActive, createdon) ' +
      'VALUES($1,(SELECT adminuserid FROM adminuser WHERE userid=$2 LIMIT 1),$3, current_timestamp) RETURNING questionlistid',
      surveyToSave.title, surveyToSave.madeBy.id, surveyToSave.isActive
    )

    if (saveQueryResult.rowCount > 0) {
      const surveyId = saveQueryResult.rows[0].questionlistid

      for (const question of surveyToSave.questions) {
        await Database.executeSQLStatement(
          'INSERT INTO question(questionidlistid,question, questiontype) VALUES($1,$2,$3)',
          surveyId, question.description, question.type
        )
      }

      return true
    } else {
      return false
    }
  }

  /**
   * Parses a database row to a survey model.
   * @function
   * @param surveyDatabaseRow - Is of type database row of table questionlist.
   * @param {Admin} adminUser - Optional admin user that for the person who created this.
   * @param {SurveyQuestion[]} surveyQuestions - Questions that belong to the survey.
   * @returns {Survey} - The survey as model.
   */
  static _surveyDatabaseRowToModel (surveyDatabaseRow, adminUser = undefined, surveyQuestions = undefined) {
    return new Survey(
      surveyDatabaseRow.questionlistid,
      surveyDatabaseRow.title,
      adminUser,
      surveyDatabaseRow.createdon,
      surveyQuestions,
      surveyDatabaseRow.isactive
    )
  }

  /**
   * Parses a database row to a survey model.
   * @function
   * @param surveyQuestionDatabaseRow - Is of type database row of table question.
   * @returns {SurveyQuestion} - The survey as model.
   */
  static _surveyQuestionDatabaseRowToModel (surveyQuestionDatabaseRow) {
    return new SurveyQuestion(
      surveyQuestionDatabaseRow.questionid,
      surveyQuestionDatabaseRow.question,
      surveyQuestionDatabaseRow.questiontype
    )
  }
}
