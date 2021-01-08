
const SurveyDAO = require('../dao/surveyDAO')
const ApiResponse = require('./utils/apiResponse')
const SurveyChecker = require('./validators/surveyValidator')
const SurveyUtil = require('./utils/surveyUtil')

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
    const surveyToSave = SurveyUtil.requestBodyToSurveyModel(req)
    const errorMessage = SurveyChecker.isValidSurvey(surveyToSave)

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
    const surveyToUpdate = SurveyUtil.requestBodyToSurveyModel(req)
    const errorMessage = SurveyChecker.isValidSurvey(surveyToUpdate)

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
}
