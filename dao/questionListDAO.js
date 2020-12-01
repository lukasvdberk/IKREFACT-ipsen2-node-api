const QuestionList = require('../models/questionList')
const Admin = require('../models/admin')
const Question = require('../models/question')
const Database = require('./database')

module.exports = class QuestionListDAO {
  /**
   * Returns a list of questionlists.
   * NOTE this will only return questionlist metadata (like title createon etc) if you also want the questions call getAllQuestionListsWithQuestions
   * @function
   * @param {QuestionList} questionList - Needs to be of questionlist model.
   * @returns {QuestionList[]} - Array of QuestionLists without quesions
   */
  static async getAllQuestionLists () {
    const result = await Database.executeSQLStatement(
      'SELECT * FROM questionlist WHERE isactive = true'
    )

    const questionLists = []
    // TODO set madeby correctly
    result.rows.forEach((row) => {
      questionLists.push(new QuestionList(
        row.questionlistid,
        row.title,
        undefined,
        row.createdon,
        undefined,
        row.isactive
      ))
    })

    return questionLists
  }

  /**
   * Returns a list of questionlists with all questions incluced.
   * @function
   * @param {QuestionList} questionList - Needs to be of questionlist model.
   * @returns {QuestionList[]} - Array of QuestionLists without quesions
   */
  static async getAllQuestionListsWithQuestions () {
    const result = await Database.executeSQLStatement(
      'SELECT * FROM questionlist WHERE isactive = true'
    )

    const questionLists = []
    // TODO set madeby correctly
    for (let i = 0; i < result.rows.length; i++) {
      // adds questions to the questionlist
      const row = result.rows[i]
      const questionsDb = await Database.executeSQLStatement(
        'SELECT * FROM question WHERE questionidlistid=$1::integer',
        row.questionlistid
      )

      const questions = []
      questionsDb.rows.forEach((questionRow) => {
        questions.push(new Question(questionRow.questionId, questionRow.description, questionRow.type))
      })

      const questionList = new QuestionList(
        row.questionlistid,
        row.title,
        undefined,
        row.createdon,
        questions,
        row.isactive
      )
      questionLists.push(questionList)
    }

    return questionLists
  }

  /**
   * Gets a specific question list by id.
   * @function
   * @param {number} questionListId - ID of the question list to get.
   * @returns {QuestionList} - Returns the requested question list model.
   */
  static async getQuestionListById (questionListId) {
    const result = await Database.executeSQLStatement(
      'SELECT * FROM questionlist WHERE questionlistid=$1::integer', questionListId
    )

    if (result.rowCount > 0) {
      const row = result.rows[0]

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

      const questionsDb = await Database.executeSQLStatement(
        'SELECT * FROM question WHERE questionidlistid=$1::integer',
        questionListId
      )

      questionsDb.rows.forEach((questionRow) => {
        questions.push(new Question(questionRow.questionid, questionRow.question, questionRow.questiontype))
      })

      const questionList = new QuestionList(
        row.questionlistid,
        row.title,
        adminUser,
        row.createdon,
        questions,
        row.isactive
      )

      return questionList
    }
    return undefined
  }

  /**
   * Update a existing question list with edits made by admin
   * @param {Number} existingQuesitonListId - Id from the not updated questionlist.
   * @param {QuestionList} updatedQuestionList - Questionlist that is updated.
   * @returns {result} - Updated questionlist as a result.
   */
  static async updateQuestionList (existingQuesitonListId, updatedQuestionList) {
    const result = await Database.executeSQLStatement(
      'UPDATE questionlist SET isactive=false WHERE questionlistid=$1::integer',
      existingQuesitonListId
    )
    const newInsertResult = await this.saveQuestionList(updatedQuestionList)

    return result.rowCount > 0 && newInsertResult
  }

  /**
   * Saves a questionlist to the database
   * @function
   * @param {QuestionList} questionList - Needs to be of questionlist model.
   * @returns {boolean} - wheather it was saved or not.
   */
  static async saveQuestionList (questionList) {
    const result = await Database.executeSQLStatement(
      'INSERT INTO questionlist(title, madebyadmin, isActive, createdon) ' +
      'VALUES($1,(SELECT adminuserid FROM adminuser WHERE userid=$2 LIMIT 1),$3, current_timestamp) RETURNING questionlistid',
      questionList.getTitle, questionList.getMadeBy.getId, questionList.getIsActive
    )

    if (result.rowCount > 0) {
      const questionListId = result.rows[0].questionlistid

      for (const question of questionList.getQuestions) {
        await Database.executeSQLStatement(
          'INSERT INTO question(questionidlistid,question, questiontype) VALUES($1,$2,$3)',
          questionListId, question.getDescription, question.getType
        )
      }
      return true
    } else {
      return false
    }
  }
}
