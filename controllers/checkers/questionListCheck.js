const Question = require('../../models/question')
const QuestionTypes = require('../../models/questionTypeEnum')

module.exports = class questionListChecker {
  /**
  * Checks if questions are filled in correctly.
  * @param {String} title - Title of questionlist.
  * @param {ExpressReq} questionsReq - A valid express response object to send the response with.
  */
  static questionListCheck (title, questionsReq) {
    const questionsModels = []
    if (questionsReq.length > 0 || title) {
      for (let i = 0; i < questionsReq.length; i++) {
        const question = questionsReq[i]
        if ([QuestionTypes.TEXT_QUESTION, QuestionTypes.FILE_QUESTION].includes(question.type)) {
          const questionModel = new Question(undefined, question.description, question.type)
          questionsModels.push(questionModel)
        } else {
          return 'There is an invalid question type'
        }
      }
    } else {
      return 'You did not supply any questions'
    }
  }
}
