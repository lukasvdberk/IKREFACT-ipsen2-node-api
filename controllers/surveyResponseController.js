const SurveyResponseDAO = require('../dao/surveyResponseDAO')
const ApiResponse = require('./utils/apiResponse')
const SurveyResponseCouldNotBeSaved = require('../dao/exceptions/surveyCouldNotBeSaved')
const SurveyResponseCouldNotBeUpdated = require('../dao/exceptions/surveyResponseCouldNotBeUpdated')
const SurveyValidNotValid = require('./exceptions/surveyResponseNotValid')
const SurveyAnswer = require('../models/answer')
const SurveyResponse = require('../models/surveyResponse')
const SurveyQuestion = require('../models/surveyQuestion')

module.exports = class SurveyResponseController {
  /**
   * Gets all question lists belonging to the logged in user.
   * @function
   * @returns {json} response
   * @
   */
  static async surveyResponsesFromUser (req, res) {
    try {
      const userToRetrieveFilledSurveysFrom = req.user
      const listOfSurvey = await SurveyResponseDAO.getFinishedSurveyResponsesByUserId(userToRetrieveFilledSurveysFrom.id)

      return ApiResponse.sendSuccessApiResponse(listOfSurvey, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve filled in questionlist', res)
    }
  }

  static async getSurveyResponseById (req, res) {
    try {
      const surveyIdToRetrieveById = req.params.questionListId
      const user = req.user
      const surveyBydId = await SurveyResponseDAO.getExistingSurveyResponseFromUser(user, surveyIdToRetrieveById)

      return ApiResponse.sendSuccessApiResponse(surveyBydId, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve filled in answerlist', res)
    }
  }

  /**
   * Saves an answer list to the database.
   * @function
   * @returns {json} - Returns a response.
   */
  static async saveSurveyResponse (req, res) {
    try {
      const surveyResponseToSave = SurveyResponseController._requestBodyToSurveyResponseModel(req)

      // can throw SurveyValidNotValid if it is invalid
      SurveyResponseController._checkIsValidSurveyResponse(surveyResponseToSave)

      await SurveyResponseDAO.saveSurveyResponse(surveyResponseToSave, false)

      return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
    } catch (exception) {
      if (exception instanceof SurveyResponseCouldNotBeSaved) {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save data', res)
      }
      if (exception instanceof SurveyValidNotValid) {
        return ApiResponse.sendErrorApiResponse(400, 'You did not supply any answers.', res)
      } else {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save answerlist', res)
      }
    }
  }

  static async editSurveyResponseAndMarkAsDone (req, res) {
    try {
      const surveyResponseToUpdate = SurveyResponseController._requestBodyToSurveyResponseModel(req)

      // can throw SurveyValidNotValid if it is invalid
      SurveyResponseController._checkIsValidSurveyResponse(surveyResponseToUpdate)

      await SurveyResponseDAO.updateSurveyResponse(surveyResponseToUpdate, true)

      return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
    } catch (exception) {
      if (exception instanceof SurveyResponseCouldNotBeUpdated) {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save data', res)
      }
      if (exception instanceof SurveyValidNotValid) {
        return ApiResponse.sendErrorApiResponse(400, 'You did not supply any answers.', res)
      } else {
        return ApiResponse.sendErrorApiResponse(500, 'Could not save answerlist', res)
      }
    }
  }

  static _requestBodyToSurveyResponseModel (req) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []

    for (let i = 0; i < answersReq.length; i++) {
      const answer = answersReq[i]
      // undefined since we only get the id for a question
      const answerModel = new SurveyAnswer(new SurveyQuestion(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
      answers.push(answerModel)
    }

    const existingSurveyId = req.id

    return new SurveyResponse(existingSurveyId, user, undefined, answers)
  }

  static _checkIsValidSurveyResponse (surveyResponseToCheck) {
    const isValid = surveyResponseToCheck.answers.length > 0
    if (!isValid) {
      throw new SurveyValidNotValid('Survey has invalid data')
    }
  }
}
