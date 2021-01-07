const SurveyResponseDAO = require('../dao/surveyResponseDAO')
const SurveyAnswer = require('../models/answer')
const SurveyResponse = require('../models/surveyResponse')
const SurveyQuestion = require('../models/surveyQuestion')
const ApiResponse = require('./utils/apiResponse')
const SurveyResponseUtil = require('./utils/surveyResponseUtil')

module.exports = class SurveyResponseController {
  /**
   * Gets all question lists belonging to the logged in user.
   * @function
   * @returns {json} response
   * @
   */
  static async surveyResponsesFromUser (req, res, next) {
    try {
      const userToRetrieveFilledSurveysFrom = req.user
      const listOfSurvey = await SurveyResponseDAO.getFinishedSurveyResponsesByUserId(userToRetrieveFilledSurveysFrom.getId)
      return ApiResponse.sendSuccessApiResponse(listOfSurvey, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve filled in questionlist', res)
    }
  }

  static async getSurveyResponseById (req, res, next) {
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
  static async saveSurveyResponse (req, res, next) {
    const surveyResponseToSave = SurveyResponseUtil.requestBodyToSurveyModel(req)

    if (surveyResponseToSave.answers.length > 0) {
      try {
        const isSaved = await SurveyResponseDAO.saveSurveyResponse(surveyResponseToSave, false)
        if (isSaved) {
          return res.json({
            success: true,
            saved: true
          })
        } else {
          return res.status(500).json({
            success: false,
            errorMessage: 'Could not save data'
          })
        }
      } catch (ignored) {
        return res.json({
          success: false,
          errorMessage: 'Could not save answerlist'
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        errorMessage: 'You did not supply any answers.'
      })
    }
  }

  static async editSurveyResponseAndMarkAsDone (req, res, next) {
    const surveyResponseToUpdate = SurveyResponseUtil.requestBodyToSurveyModel(req)

    if (surveyResponseToUpdate.answers.length > 0) {
      try {
        const isUpdated = await SurveyResponseDAO.updateSurveyResponse(surveyResponseToUpdate, true)
        if (isUpdated) {
          return res.json({
            success: true,
            saved: true
          })
        } else {
          return res.status(500).json({
            success: false,
            errorMessage: 'Could not save data'
          })
        }
      } catch (ignored) {
        return res.json({
          success: false,
          errorMessage: 'Could not save answerlist'
        })
      }
    } else {
      return res.status(400).json({
        success: false,
        errorMessage: 'You did not supply any answers.'
      })
    }
  }

  static addFileToAnswer (req, res, next) {

  }
}
