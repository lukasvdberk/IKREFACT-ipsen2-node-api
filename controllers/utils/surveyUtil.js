const Survey = require('../../models/survey')
const SurveyQuestion = require('../../models/surveyQuestion')

module.exports = class SurveyUtil {
  static requestBodyToSurveyModel (req) {
    const id = req.body.id
    const admin = req.user
    const title = req.body.title
    const questionsReq = req.body.questions

    const questions = []

    for (let i = 0; i < questionsReq.length; i++) {
      const question = questionsReq[i]
      const questionModel = new SurveyQuestion(question.id, question.description, question.type)
      questions.push(questionModel)
    }
    return new Survey(id, title, admin, undefined, questions, true)
  }
}
