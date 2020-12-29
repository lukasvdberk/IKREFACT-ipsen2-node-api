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
   * @param {SurveyResponse} surveyResponseToSave - SurveyResponse to save.
   * @param {boolean} markSurveyAsDone - Whether the saved SurveyResponse is the final version or not.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async saveSurveyResponse (surveyResponseToSave, markSurveyAsDone) {
    try {
      const isSurveySaved = await SurveyResponseDAO._saveNewSurveyResponse(surveyResponseToSave)

      if (markSurveyAsDone && isSurveySaved) {
        await SurveyResponseDAO._markSurveyResponseAsDone(surveyResponseToSave)
      }

      return isSurveySaved
    } catch (ignored) {
      return false
    }
  }

  static async updateSurveyResponse (surveyToUpdate, markSurveyAsDone) {
    try {
      if (markSurveyAsDone) {
        await SurveyResponseDAO._markSurveyResponseAsDone(surveyToUpdate)
      }
      await SurveyResponseDAO._updateAnswersOfSurveyResponse(surveyToUpdate)
      return true
    } catch (ignored) {
      return false
    }
  }

  // TODO add better naming for functions below
  static async _updateAnswersOfSurveyResponse (surveyResponseWithAnswers) {
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

  static async _saveAnswersOfSurveyResponse (surveyResponseWithAnswers) {
    for (const answer of surveyResponseWithAnswers.getAnswers) {
      await Database.executeSQLStatement(
        'INSERT INTO answer(questionid, answerlistid, answer) VALUES($1,$2,$3)',
        answer.getQuestion.getId, surveyResponseWithAnswers.getId, answer.getTextAnswer
      )
    }
  }

  static async _markSurveyResponseAsDone (surveyToUpdate) {
    return await Database.executeSQLStatement(
      `
          UPDATE answerlist
          SET finishedon = current_timestamp
          WHERE answerlistid = $1::integer;
          `,
      surveyToUpdate.getId
    )
  }

  /**
   * Saves an survey response to the database.
   * @function
   * @param {Survey} surveyResponseToSave - SurveyResponse to save.
   * @returns {boolean} - returns if it was saved or  not.
   * */
  static async _saveNewSurveyResponse (surveyResponseToSave) {
    try {
      const insertResult = await Database.executeSQLStatement(
        'INSERT INTO answerlist(filledbyuser) ' +
        'VALUES($1) RETURNING answerlistid',
        surveyResponseToSave.getFilledByUser.getId
      )

      // add newly set Id to model for the answers of the survey
      surveyResponseToSave.id = insertResult.rows[0].answerlistid
      await SurveyResponseDAO._saveAnswersOfSurveyResponse(surveyResponseToSave)
      return true
    } catch (ignored) {
      return false
    }
  }
}
