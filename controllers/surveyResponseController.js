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
  static surveyResponsesFromUser (req, res, next) {
    const userToRetrieveFilledSurveysFrom = req.user
    SurveyResponseDAO.getFinishedSurveyResponsesByUserId(userToRetrieveFilledSurveysFrom.getId).then((listOfSurvey) => {
      return ApiResponse.sendSuccessApiResponse(listOfSurvey, res)
    }).catch((ignored) => {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve filled in questionlist', res)
    })
  }

  static getSurveyResponseById (req, res, next) {
    const surveyIdToRetrieveById = req.params.questionListId
    const user = req.user

    SurveyResponseDAO.getExistingSurveyResponseFromUser(user, surveyIdToRetrieveById).then((surveyBydId) => {
      return ApiResponse.sendSuccessApiResponse(surveyBydId, res)
    }).catch((ignored) => {
      console.log(ignored)
      return ApiResponse.sendErrorApiResponse(500, 'Failed to retrieve filled in answerlist', res)
    })
  }

  /**
   * Saves an answer list to the database.
   * @function
   * @returns {json} - Returns a response.
   */
  static saveSurveyResponse (req, res, next) {
    const surveyResponseToSave = SurveyResponseUtil.requestBodyToSurveyModel(req)

    if (surveyResponseToSave.answers.length > 0) {
      SurveyResponseDAO.saveSurveyResponse(surveyResponseToSave, false).then((isSaved) => {
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
      }).catch((ignore) => {
        console.log(ignore)
        return res.json({
          success: false,
          errorMessage: 'Could not save answerlist'
        })
      })
    } else {
      return res.status(400).json({
        success: false,
        errorMessage: 'You did not supply any answers.'
      })
    }
  }

  static editSurveyResponseAndMarkAsDone (req, res, next) {
    const surveyResponseToUpdate = SurveyResponseUtil.requestBodyToSurveyModel(req)

    if (surveyResponseToUpdate.answers.length > 0) {
      SurveyResponseDAO.updateSurveyResponse(surveyResponseToUpdate, true).then((isUpdated) => {
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
      }).catch((ignore) => {
        return res.json({
          success: false,
          errorMessage: 'Could not save answerlist'
        })
      })
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
