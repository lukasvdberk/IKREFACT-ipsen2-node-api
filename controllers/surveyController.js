const Survey = require('../models/survey')
const SurveyDAO = require('../dao/surveyDAO')
const ApiResponse = require('./utils/apiResponse')
const SurveyChecker = require('./validators/surveyValidator')
const SurveyQuestion = require('../models/surveyQuestion')

module.exports = class SurveyController {
  static getSurveys (req, res, next) {
    SurveyDAO.getAllSurveys().then((listOfSurveys) => {
      return ApiResponse.sendSuccessApiResponse(listOfSurveys, res)
    }).catch((ignored) => {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve questions', res)
    })
  }

  /**
   * Gets survey by id.
   * @function
   * @returns {json} - Returns a response.
   */
  static surveyById (req, res, next) {
    const surveyIdToSearch = req.params.questionListId
    SurveyDAO.getSurveyById(surveyIdToSearch).then((surveyToReturn) => {
      return ApiResponse.sendSuccessApiResponse(surveyToReturn, res)
    }).catch((ignored) => {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve questions', res)
    })
  }

  static saveSurvey (req, res, next) {
    const admin = req.user
    const title = req.body.title
    const questionsReq = req.body.questions

    const questions = []

    const errorMessage = SurveyChecker.isValidSurvey(title, questionsReq)

    if (errorMessage === undefined) {
      for (let i = 0; i < questionsReq.length; i++) {
        const question = questionsReq[i]
        const questionModel = new SurveyQuestion(undefined, question.description, question.type)
        questions.push(questionModel)
      }
      const surveyToSave = new Survey(undefined, title, admin, undefined, questions, true)
      SurveyDAO.saveSurvey(surveyToSave).then((success) => {
        if (success) {
          return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
        } else {
          return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
        }
      }).catch((ignore) => {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
      })
    } else {
      console.log(errorMessage)
      return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
    }
  }

  static editSurvey (req, res, next) {
    const id = req.body.id
    const admin = req.user
    const title = req.body.title
    const questionsReq = req.body.questions

    const questionsModels = []

    const errorMessage = SurveyChecker.isValidSurvey(title, questionsReq)
    SurveyDAO.getSurveyById(id).then((existingSurvey) => {
      if (existingSurvey === undefined) {
        return ApiResponse.sendErrorApiResponse(404, 'Question list not found', res)
      } else {
        if (errorMessage === undefined) {
          for (let i = 0; i < questionsReq.length; i++) {
            const question = questionsReq[i]
            const questionModel = new SurveyQuestion(undefined, question.description, question.type)
            questionsModels.push(questionModel)
          }
          const survey = new SurveyQuestion(undefined, title, admin, undefined, questionsModels, true)
          SurveyDAO.updateSurvey(id, survey).then((success) => {
            if (success) {
              return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
            } else {
              return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
            }
          }).catch((ignore) => {
            return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
          })
        } else {
          return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
        }
      }
    })
  }
}
