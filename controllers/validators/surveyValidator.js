const SurveyQuestion = require('../../models/surveyQuestion')
const QuestionTypes = require('../../models/questionTypeEnum')

module.exports = class SurveyValidator {
  /**
  * Checks if questions are filled in correctly.
  * @param {String} title - Title of survey.
  * @param {ExpressReq} questionsReq - A valid express response object to send the response with.
  */
  static isValidSurvey (title, questionsReq) {
    const surveyQuestions = []
    if (questionsReq.length > 0 || title) {
      for (let i = 0; i < questionsReq.length; i++) {
        const question = questionsReq[i]
        if ([QuestionTypes.TEXT_QUESTION, QuestionTypes.FILE_QUESTION].includes(question.type)) {
          const questionForSurvey = new SurveyQuestion(undefined, question.description, question.type)
          surveyQuestions.push(questionForSurvey)
        } else {
          return 'There is an invalid question type'
        }
      }
    } else {
      return 'You did not supply any questions'
    }
  }
}
