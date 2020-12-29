
const SurveyDAO = require('../dao/surveyDAO')
const ApiResponse = require('./utils/apiResponse')
const SurveyChecker = require('./validators/surveyValidator')
const SurveyUtil = require('./utils/surveyUtil')

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
    const surveyToSave = SurveyUtil.requestBodyToSurveyModel(req)
    const errorMessage = SurveyChecker.isValidSurvey(surveyToSave)

    if (errorMessage === undefined) {
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
      return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
    }
  }

  static editSurvey (req, res, next) {
    const surveyToUpdate = SurveyUtil.requestBodyToSurveyModel(req)
    const errorMessage = SurveyChecker.isValidSurvey(surveyToUpdate)

    if (errorMessage) {
      return ApiResponse.sendErrorApiResponse(400, errorMessage, res)
    } else {
      SurveyDAO.getSurveyById(surveyToUpdate.id).then((existingSurvey) => {
        if (existingSurvey === undefined) {
          return ApiResponse.sendErrorApiResponse(404, 'Question list not found', res)
        } else {
          SurveyDAO.updateSurvey(surveyToUpdate.id, surveyToUpdate).then((success) => {
            if (success) {
              return ApiResponse.sendSuccessApiResponse({ saved: true }, res)
            } else {
              return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
            }
          }).catch((ignore) => {
            return ApiResponse.sendErrorApiResponse(500, 'Could not save questionlist', res)
          })
        }
      })
    }
  }
}
