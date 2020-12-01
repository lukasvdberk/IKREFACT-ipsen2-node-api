const Database = require('./database')
const QuestionList = require('../models/questionList')
const Answer = require('../models/answer')
const Question = require('../models/question')
const AnswerList = require('../models/answerList')

module.exports = class AnswerListDAO {
  /**
   * Gets the list of quesitonslist already filled by user.
   * @function
   * @param {Number} userId - Should be a user model.
   * @returns {QuestionList[]} - Filledin questionists by user.
   */
  static async getAnswerFinishedListByUserId (userId) {
    const result = await Database.executeSQLStatement(
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
   * Gets the list of quesitonslist already filled by user.
   * @function
   * @param {User} user - Should be a user model.
   * @returns {boolean} - returns if it was saved or  not.
   */
  static async getAnswerFilledinAswerlist (user, questionlistId) {
    const result = await Database.executeSQLStatement(
      `
      SELECT answerlist.*
      FROM answerlist
      JOIN answer a ON answerlist.answerlistid = a.answerlistid
      JOIN question q ON q.questionid = a.questionid
      JOIN questionlist ql ON ql.questionlistid = q.questionidlistid
      WHERE answerlist.filledbyuser=$1::integer AND ql.questionlistid=$2::integer   
      `,
      user.getId, questionlistId
    )

    // TODO set madeby correctly
    if (result.rowCount > 0) {
      const row = result.rows[0]
      const answersDb = await Database.executeSQLStatement(
        `
        SELECT answer.*, q.*
        FROM answer
        JOIN question q on answer.questionid = q.questionid
        WHERE answerlistid=$1::integer
        `,
        row.answerlistid
      )

      const answers = []
      answersDb.rows.forEach((answerDb) => {
        const question = new Question(answerDb.questionid, answerDb.question, answerDb.questiontype)

        // TODO add file support
        answers.push(new Answer(question, answerDb.answer, []))
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
    let result = null
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
        result = await this.updateAnswerList('finalUpdate', answerList)
      } else {
        // insert if isUnfinished does not exist
        result = await this.updateAnswerList('finalInsert', answerList)
        answerList.id = result.rows[0].answerlistid
      }
    } else {
      result = await this.updateAnswerList('insert', answerList)
      answerList.id = result.rows[0].answerlistid
    }

    if (result.rowCount > 0) {
      // const answerListId = result.rows[0].answerlistid

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
    let result = null
    switch (setting) {
      case 'finalUpdate':
        result = await Database.executeSQLStatement(
          `
          UPDATE answerlist
          SET finishedon = current_timestamp
          WHERE answerlistid = $1::integer;
          `,
          answerList.getId
        )
        return result
      case 'finalInsert':
        result = await Database.executeSQLStatement(
          'INSERT INTO answerlist(filledbyuser, finishedon) ' +
          'VALUES($1,current_timestamp) RETURNING answerlistid',
          answerList.getFilledByUser.getId
        )
        return result
      case 'insert':
        result = await Database.executeSQLStatement(
          'INSERT INTO answerlist(filledbyuser) ' +
          'VALUES($1) RETURNING answerlistid',
          answerList.getFilledByUser.getId
        )
        return result
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
