const AnswerListDAO = require('../dao/answerListDAO')
const Answer = require('../models/answer')
const AnswerList = require('../models/answerList')
const Question = require('../models/question')
const ApiResponse = require('./utils/apiResponse')

module.exports = class AnswerListController {
  /**
   * Gets all question lists belonging to the logged in user.
   * @function
   * @returns {json} response
   * @
   */
  static answerLists (req, res, next) {
    // answerslist by user
    const user = req.user
    AnswerListDAO.getAnswerFinishedListByUserId(user.getId).then((questionlist) => {
      return ApiResponse.successResponse(questionlist, res)
    }).catch((ignored) => {
      return ApiResponse.errorResponse(500, 'Failed to retrieve filled in questionlist', res)
    })
  }

  static answerListByIdQuestionListId (req, res, next) {
    // fetches answerlist by questionid.
    // TODO haal vragenlijsten op met questionid en ingevulde vragen
    var questionListId = req.params.questionListId
    const user = req.user

    AnswerListDAO.getAnswerFilledinAswerlist(user, questionListId).then((answerlist) => {
      return ApiResponse.successResponse(answerlist, res)
    }).catch((ignored) => {
      console.log(ignored)
      return ApiResponse.errorResponse(500, 'Failed to retrieve filled in answerlist', res)
    })
  }

  /**
   * Saves an answer list to the database.
   * @function
   * @returns {json} - Returns a response.
   */
  static saveAnswerList (req, res, next) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []

    if (answersReq.length > 0) {
      for (let i = 0; i < answersReq.length; i++) {
        const answer = answersReq[i]
        const answerModel = new Answer(new Question(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
        answers.push(answerModel)
      }

      let answerList = null
      const answerlistId = req.id

      answerList = new AnswerList(answerlistId, user, undefined, answers)

      AnswerListDAO.saveAnswerList(answerList, false).then((success) => {
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

  static finalizeAnswerList (req, res, next) {
    const user = req.user
    const answersReq = req.body.answers
    const answers = []
    const answerlistId = req.body.id

    if (answersReq.length > 0) {
      for (let i = 0; i < answersReq.length; i++) {
        const answer = answersReq[i]
        const answerModel = new Answer(new Question(answer.question.id, undefined, undefined), answer.textAnswer, undefined)
        answers.push(answerModel)
      }

      let answerList = null
      if (answerlistId !== 0) {
        answerList = new AnswerList(answerlistId, user, undefined, answers)
      } else {
        answerList = new AnswerList(undefined, user, undefined, answers)
      }

      AnswerListDAO.saveAnswerList(answerList, true).then((success) => {
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
