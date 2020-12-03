const Database = require('./database')
const Survey = require('../models/survey')
const Answer = require('../models/answer')
const SurveyQuestion = require('../models/surveyQuestion')
const AnswerList = require('../models/answerList')

module.exports = class AnswerListDAO {
  /**
   * Gets the list of quesitonslist already filled by user.
   * @function
   * @param {Number} userId - Should be a user model.
   * @returns {Survey[]} - Filledin questionists by user.
   */
  static async getAnswerFinishedListByUserId (userId) {
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
   * Gets the list of quesitonslist already filled by user.
   * @function
   * @param {User} user - Should be a user model.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async getAnswerFilledinAswerlist (user, surveyId) {
    const filledAnswerListQueryResult = await Database.executeSQLStatement(
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
    if (filledAnswerListQueryResult.rowCount > 0) {
      const row = filledAnswerListQueryResult.rows[0]
      const answersFromAnswerListQueryResult = await Database.executeSQLStatement(
        `
        SELECT answer.*, q.*
        FROM answer
        JOIN question q on answer.questionid = q.questionid
        WHERE answerlistid=$1::integer
        `,
        row.answerlistid
      )

      const answers = []
      answersFromAnswerListQueryResult.rows.forEach((answer) => {
        const question = new SurveyQuestion(answer.questionid, answer.question, answer.questiontype)

        // TODO add file support
        answers.push(new Answer(question, answer.answer, []))
      })

      return new AnswerList(
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
   * @param {AnswerList} answerList - AnswerList to save.
   * @param {boolean} final - Whether the saved answerlist is the final version or not.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async saveAnswerList (answerList, final) {
    let queryResult = null
    let isUnfinished = null

    if (answerList.getId) {
      const unfinishedAnswerlist = await Database.executeSQLStatement(
        `
        SELECT *
        FROM answerlist
        WHERE answerlistid = $1::integer AND finishedOn IS NULL;
        `,
        answerList.getId
      )
      isUnfinished = unfinishedAnswerlist.rowCount
    }

    if (final === true) {
      if (isUnfinished === 1) {
        // update if isUnfinished exist
        queryResult = await this.updateAnswerList('finalUpdate', answerList)
      } else {
        // insert if isUnfinished does not exist
        queryResult = await this.updateAnswerList('finalInsert', answerList)
        answerList.id = queryResult.rows[0].answerlistid
      }
    } else {
      queryResult = await this.updateAnswerList('insert', answerList)
      answerList.id = queryResult.rows[0].answerlistid
    }

    if (queryResult.rowCount > 0) {
      // const answerListId = queryResult.rows[0].answerlistid

      if (final === true) {
        if (isUnfinished === 1) {
          // update if isUnfinished exist
          await this.updateAnswer('finalUpdate', answerList)
        } else {
          // insert if isUnfinished does not exist
          await this.updateAnswer('finalInsert', answerList)
        }
      } else {
        await this.updateAnswer('insert', answerList)
      }
      return true
    } else {
      return false
    }
  }

  static async updateAnswerList (setting, answerList) {
    let queryResult = null
    switch (setting) {
      case 'finalUpdate':
        queryResult = await Database.executeSQLStatement(
          `
          UPDATE answerlist
          SET finishedon = current_timestamp
          WHERE answerlistid = $1::integer;
          `,
          answerList.getId
        )
        return queryResult
      case 'finalInsert':
        queryResult = await Database.executeSQLStatement(
          'INSERT INTO answerlist(filledbyuser, finishedon) ' +
          'VALUES($1,current_timestamp) RETURNING answerlistid',
          answerList.getFilledByUser.getId
        )
        return queryResult
      case 'insert':
        queryResult = await Database.executeSQLStatement(
          'INSERT INTO answerlist(filledbyuser) ' +
          'VALUES($1) RETURNING answerlistid',
          answerList.getFilledByUser.getId
        )
        return queryResult
    }
  }

  static async updateAnswer (setting, answerList) {
    switch (setting) {
      case 'finalUpdate':
        for (const answer of answerList.getAnswers) {
          await Database.executeSQLStatement(
            `
            UPDATE answer
            SET answer = $1
            WHERE answerlistid = $2 AND questionid = $3;
            `,
            answer.getTextAnswer, answerList.getId, answer.getQuestion.getId
          )
        }
        break
      case 'finalInsert':
        for (const answer of answerList.getAnswers) {
          await Database.executeSQLStatement(
            'INSERT INTO answer(questionid, answerlistid, answer) VALUES($1,$2,$3)',
            answer.getQuestion.getId, answerList.getId, answer.getTextAnswer
          )
        }
        break
      case 'insert':
        for (const answer of answerList.getAnswers) {
          await Database.executeSQLStatement(
            'INSERT INTO answer(questionid, answerlistid, answer) VALUES($1,$2,$3)',
            answer.getQuestion.getId, answerList.getId, answer.getTextAnswer
          )
        }
        break
    }
  }
}
