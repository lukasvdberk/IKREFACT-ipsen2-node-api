const SurveyResponseDAO = require('../dao/surveyResponseDAO')
const Answer = require('../models/answer')
const SurveyResponse = require('../models/surveyResponse')
const SurveyQuestion = require('../models/surveyQuestion')
const ApiResponse = require('./utils/apiResponse')

module.exports = class SurveyResponseController {
  /**
   * Gets all question lists belonging to the logged in user.
   * @function
   * @returns {json} response
   * @
   */
  static surveyResponsesFromUser (req, res, next) {
    // survey responses by user
    const user = req.user
    SurveyResponseDAO.getFinishedSurveyResponsesByUserId(user.getId).then((listOfSurvey) => {
      return ApiResponse.sendSuccessApiResponse(listOfSurvey, res)
    }).catch((ignored) => {
      return ApiResponse.sendErrorApiReponse(500, 'Failed to retrieve filled in questionlist', res)
    })
  }

  static getSurveyResponseById (req, res, next) {
    // fetches surveyresponse by survey id.
    // TODO haal vragenlijsten op met questionid en ingevulde vragen
    const surveyId = req.params.questionListId
    const user = req.user

    SurveyResponseDAO.getExistingSurveyResponseFromUser(user, surveyId).then((surveyBydId) => {
      return ApiResponse.sendSuccessApiResponse(surveyBydId, res)
    }).catch((ignored) => {
      console.log(ignored)
      return ApiResponse.sendErrorApiReponse(500, 'Failed to retrieve filled in answerlist', res)
    })
  }

  /**
   * Saves an answer list to the database.
   * @function
   * @returns {json} - Returns a response.
   */
  static saveSurveyResponse (req, res, next) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []

    if (answersReq.length > 0) {
      for (let i = 0; i < answersReq.length; i++) {
        const answer = answersReq[i]
        const answerModel = new Answer(SurveyQuestion(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
        answers.push(answerModel)
      }

      let surveyResponseToSave = null
      const existingSurveyId = req.id

      surveyResponseToSave = new SurveyResponse(existingSurveyId, user, undefined, answers)

      SurveyResponseDAO.saveSurveyResponse(surveyResponseToSave, false).then((success) => {
        if (success) {
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

  static finalizeExistingSurveyResponse (req, res, next) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []
    const existingSurveyId = req.body.id

    if (answersReq.length > 0) {
      for (let i = 0; i < answersReq.length; i++) {
        const answer = answersReq[i]
        const surveyAnswer = new Answer(new SurveyQuestion(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
        answers.push(surveyAnswer)
      }

      let surveyToFinalize = null
      if (existingSurveyId !== 0) {
        surveyToFinalize = new SurveyResponse(existingSurveyId, user, undefined, answers)
      } else {
        surveyToFinalize = new SurveyResponse(undefined, user, undefined, answers)
      }

      SurveyResponseDAO.saveSurveyResponse(surveyToFinalize, true).then((success) => {
        if (success) {
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
