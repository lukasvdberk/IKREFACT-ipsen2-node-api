const SurveyDAO = require('../dao/surveyDAO')
const ApiResponse = require('./utils/apiResponse')
const Survey = require('../models/survey')
const SurveyQuestion = require('../models/surveyQuestion')
const QuestionTypes = require('../models/questionTypeEnum')

module.exports = class SurveyController {
  static async getSurveys (req, res) {
    try {
      const listOfSurveys = await SurveyDAO.getAllSurveys()

      return ApiResponse.sendSuccessApiResponse(listOfSurveys, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve questions', res)
    }
  }

  /**
   * Gets survey by id.
   * @function
   * @returns {json} - Returns a response.
   */
  static async surveyById (req, res, next) {
    try {
      const surveyIdToSearch = req.params.questionListId
      const surveyToReturn = await SurveyDAO.getSurveyById(surveyIdToSearch)

      return ApiResponse.sendSuccessApiResponse(surveyToReturn, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve questions', res)
    }
  }

  static async saveSurvey (req, res) {
    const surveyToSave = SurveyController._requestBodyToSurveyModel(req)
    const errorMessage = SurveyController._isValidSurvey(surveyToSave)

    if (errorMessage === undefined) {
      try {
        const isSurveySaved = await SurveyDAO.saveSurvey(surveyToSave)

        if (isSurveySaved) {
          return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
        } else {
          return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
        }
      } catch (ignored) {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
      }
    } else {
      return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
    }
  }

  static async editSurvey (req, res) {
    const surveyToUpdate = SurveyController._requestBodyToSurveyModel(req)
    const errorMessage = SurveyController._isValidSurvey(surveyToUpdate)

    if (errorMessage) {
      return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
    } else {
      const existingSurvey = await SurveyDAO.getSurveyById(surveyToUpdate.id)

      if (existingSurvey === undefined) {
        return ApiResponse.sendErrorApiResponse(404, 'Question list not found', res)
      } else {
        try {
          const isSurveyUpdated = await SurveyDAO.updateSurvey(surveyToUpdate.id, surveyToUpdate)

          if (isSurveyUpdated) {
            return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
          } else {
            return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
          }
        } catch (ignored) {
          return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
        }
      }
    }
  }

  /**
   * Checks if questions are filled in correctly.
   * @param {Survey} surveyModel - A valid express response object to send the response with.
   */
  static _isValidSurvey (surveyModel) {
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

  static _requestBodyToSurveyModel (req) {
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
