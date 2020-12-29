const QuestionTypes = require('../../models/questionTypeEnum')

module.exports = class SurveyValidator {
  /**
  * Checks if questions are filled in correctly.
  * @param {SurveyResponse} surveyModel - A valid express response object to send the response with.
  */
  static isValidSurvey (surveyModel) {
    if (surveyModel.questions.length > 0 || surveyModel.title) {
      for (let i = 0; i < surveyModel.questions.length; i++) {
        const question = surveyModel.questions[i]
        if (![QuestionTypes.TEXT_QUESTION, QuestionTypes.FILE_QUESTION].includes(question.type)) {
          return 'There is an invalid question type'
        }
      }
    } else {
      return 'You did not supply any questions'
    }
  }
}
