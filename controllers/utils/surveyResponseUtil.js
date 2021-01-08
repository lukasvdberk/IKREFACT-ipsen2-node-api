const SurveyAnswer = require('../../models/answer')
const SurveyResponse = require('../../models/surveyResponse')
const SurveyQuestion = require('../../models/surveyQuestion')

module.exports = class SurveyResponseUtil {
  static requestBodyToSurveyModel (req) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []

    for (let i = 0; i < answersReq.length; i++) {
      const answer = answersReq[i]
      const answerModel = new SurveyAnswer(new SurveyQuestion(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
      answers.push(answerModel)
    }

    const existingSurveyId = req.id

    return new SurveyResponse(existingSurveyId, user, undefined, answers)
  }
}
