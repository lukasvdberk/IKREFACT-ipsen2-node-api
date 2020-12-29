const Database = require('./database')
const Survey = require('../models/survey')
const Answer = require('../models/answer')
const SurveyQuestion = require('../models/surveyQuestion')
const SurveyResponse = require('../models/surveyResponse')

module.exports = class SurveyResponseDAO {
  /**
   * Gets the list of Survey already filled by user.
   * @function
   * @param {Number} userId - Should be a user model.
   * @returns {Survey[]} - Filledin questionists by user.
   */
  static async getFinishedSurveyResponsesByUserId (userId) {
    const surveyListQueryResult = await Database.executeSQLStatement(
      `
      SELECT ql.*
      FROM answerlist
      JOIN answer a ON answerlist.answerlistid = a.answerlistid
      JOIN question q ON q.questionid = a.questionid
      JOIN questionlist ql ON ql.questionlistid = q.questionidlistid
      WHERE answerlist.filledbyuser=$1::integer
      GROUP BY ql.questionlistid;
      `,
      userId
    )

    const listOfSurveys = []
    // TODO set madeby correctly
    surveyListQueryResult.rows.forEach((row) => {
      listOfSurveys.push(new Survey(
        row.questionlistid,
        row.title,
        undefined,
        row.createdon,
        undefined,
        row.isactive
      ))
    })

    return listOfSurveys
  }

  /**
   * Gets the list of survey already filled by user.
   * @function
   * @param {User} user - Should be a user model.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async getExistingSurveyResponseFromUser (user, surveyId) {
    const existingSurveyResponseQueryResult = await Database.executeSQLStatement(
      `
      SELECT answerlist.*
      FROM answerlist
      JOIN answer a ON answerlist.answerlistid = a.answerlistid
      JOIN question q ON q.questionid = a.questionid
      JOIN questionlist ql ON ql.questionlistid = q.questionidlistid
      WHERE answerlist.filledbyuser=$1::integer AND ql.questionlistid=$2::integer   
      `,
      user.getId, surveyId
    )

    // TODO set madeby correctly
    if (existingSurveyResponseQueryResult.rowCount > 0) {
      const row = existingSurveyResponseQueryResult.rows[0]
      const answersFromSurveyResponseQueryResult = await Database.executeSQLStatement(
        `
        SELECT answer.*, q.*
        FROM answer
        JOIN question q on answer.questionid = q.questionid
        WHERE answerlistid=$1::integer
        `,
        row.answerlistid
      )

      const answers = []
      answersFromSurveyResponseQueryResult.rows.forEach((answer) => {
        const question = new SurveyQuestion(answer.questionid, answer.question, answer.questiontype)

        // TODO add file support
        answers.push(new Answer(question, answer.answer, []))
      })

      return new SurveyResponse(
        row.answerlistid,
        user,
        row.finishedon,
        answers
      )
    }

    return undefined
  }

  /**
   * Saves an answer list to the database.
   * @function
   * @param {Survey} surveyResponseToSave - SurveyResponse to save.
   * @param {boolean} final - Whether the saved SurveyResponse is the final version or not.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async saveSurveyResponse (surveyResponseToSave, final) {
    let queryResult = null
    let isUnfinished = null

    if (surveyResponseToSave.getId) {
      const unfinishedSurveyResponse = await Database.executeSQLStatement(
        `
        SELECT *
        FROM answerlist
        WHERE answerlistid = $1::integer AND finishedOn IS NULL;
        `,
        surveyResponseToSave.getId
      )
      isUnfinished = unfinishedSurveyResponse.rowCount
    }

    if (final === true) {
      if (isUnfinished === 1) {
        // update if isUnfinished exist
        queryResult = await this.markSurveyResponseAsDone()
      } else {
        // insert if isUnfinished does not exist
        queryResult = await this.saveNewSurveyResponseAndMarkAsDone(surveyResponseToSave)
        surveyResponseToSave.id = queryResult.rows[0].answerlistid
      }
    } else {
      queryResult = await this.addSurveyResponse()
      surveyResponseToSave.id = queryResult.rows[0].answerlistid
    }

    if (queryResult.rowCount > 0) {
      if (final === true) {
        if (isUnfinished === 1) {
          // update if isUnfinished exist
          await this.updateAnswersOfSurveyResponse(surveyResponseToSave)
        } else {
          // insert if isUnfinished does not exist
          await this.saveAnswersOfSurveyResponse(surveyResponseToSave)
        }
      } else {
        await this.saveNewSurveyResponse(surveyResponseToSave)
      }
      return true
    } else {
      return false
    }
  }

  // TODO add better naming for functions below
  static async updateAnswersOfSurveyResponse (surveyResponseWithAnswers) {
    for (const answer of surveyResponseWithAnswers.getAnswers) {
      await Database.executeSQLStatement(
        `
            UPDATE answer
            SET answer = $1
            WHERE answerlistid = $2 AND questionid = $3;
            `,
        answer.getTextAnswer, surveyResponseWithAnswers.getId, answer.getQuestion.getId
      )
    }
  }

  static async saveAnswersOfSurveyResponse (surveyResponseWithAnswers) {
    for (const answer of surveyResponseWithAnswers.getAnswers) {
      await Database.executeSQLStatement(
        'INSERT INTO answer(questionid, answerlistid, answer) VALUES($1,$2,$3)',
        answer.getQuestion.getId, surveyResponseWithAnswers.getId, answer.getTextAnswer
      )
    }
  }

  static async markSurveyResponseAsDone (surveyToUpdate) {
    return await Database.executeSQLStatement(
      `
          UPDATE answerlist
          SET finishedon = current_timestamp
          WHERE answerlistid = $1::integer;
          `,
      surveyToUpdate.getId
    )
  }

  static async saveNewSurveyResponseAndMarkAsDone (surveyToUpdate) {
    return await Database.executeSQLStatement(
      'INSERT INTO answerlist(filledbyuser, finishedon) ' +
      'VALUES($1,current_timestamp) RETURNING answerlistid',
      surveyToUpdate.getFilledByUser.getId
    )
  }

  static async saveNewSurveyResponse (surveyToUpdate) {
    return await Database.executeSQLStatement(
      'INSERT INTO answerlist(filledbyuser) ' +
      'VALUES($1) RETURNING answerlistid',
      surveyToUpdate.getFilledByUser.getId
    )
  }
}
