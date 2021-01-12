const SurveyDAO = require('../dao/surveyDAO')
const SurveyNotFoundException = require('../dao/exceptions/surveyNotFoundException')
const SurveyNotValid = require('./exceptions/surveyNotValid')
const ApiResponse = require('./utils/apiResponse')
const Survey = require('../models/survey')
const SurveyQuestion = require('../models/surveyQuestion')
const QuestionTypes = require('../models/questionTypeEnum')

module.exports = class SurveyController {
  static async getSurveys (req, res) {
    try {
      const listOfSurveys = await SurveyDAO.getAllSurveysMetaData()

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
    try {
      const surveyToSave = SurveyController._requestBodyToSurveyModel(req)

      // can throw SurveyNotValid exception
      SurveyController._isValidSurvey(surveyToSave)

      await SurveyDAO.saveSurvey(surveyToSave)

      return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
    } catch (exception) {
      if (exception instanceof SurveyNotValid) {
        return ApiResponse.sendErrorApiResponse(400, exception.message, res)
      }
      return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
    }
  }

  static async editSurvey (req, res) {
    try {
      // check if exists will else throw an exceptions
      const surveyToUpdate = SurveyController._requestBodyToSurveyModel(req)

      // can throw SurveyNotValid exception
      SurveyController._isValidSurvey(surveyToUpdate)

      // make sure it exists before updating
      await SurveyDAO.getSurveyById(surveyToUpdate.id)
      await SurveyDAO.updateSurvey(surveyToUpdate.id, surveyToUpdate)

      return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
    } catch (exception) {
      if (exception instanceof SurveyNotFoundException) {
        return ApiResponse.sendErrorApiResponse(404, 'Question list not found', res)
      }
      if (exception instanceof SurveyNotValid) {
        return ApiResponse.sendErrorApiResponse(400, exception.message, res)
      }
      return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
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
          throw new SurveyNotValid('There is an invalid question type')
        }
      }
    } else {
      throw new SurveyNotValid('You did not supply any questions')
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

    // created on is undefined since that needs to be set by the database
    return new Survey(id, title, admin, undefined, questions, true)
  }
}
