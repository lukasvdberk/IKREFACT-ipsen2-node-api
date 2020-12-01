const QuestionList = require('../models/questionList')
const QuestionListDAO = require('../dao/questionListDAO')
const ApiResponse = require('./utils/apiResponse')
const QuestionListCheck = require('./checkers/questionListCheck')
const Question = require('../models/question')

module.exports = class QuestionListController {
  static questionList (req, res, next) {
    QuestionListDAO.getAllQuestionLists().then((questionLists) => {
      return ApiResponse.successResponse(questionLists, res)
    }).catch((ignored) => {
      return ApiResponse.errorResponse(500, 'Failed to retrieve questions', res)
    })
  }

  /**
   * Gets question list by id.
   * @function
   * @returns {json} - Returns a response.
   */
  static questionListById (req, res, next) {
    var questionListId = req.params.questionListId
    QuestionListDAO.getQuestionListById(questionListId).then((questionList) => {
      return ApiResponse.successResponse(questionList, res)
    }).catch((ignored) => {
      return ApiResponse.errorResponse(500, 'Failed to retrieve questions', res)
    })
  }

  static saveQuestionList (req, res, next) {
    const admin = req.user
    const title = req.body.title
    const questionsReq = req.body.questions

    const questionsModels = []

    const errorMessage = QuestionListCheck.questionListCheck(title, questionsReq)

    if (errorMessage === undefined) {
      for (let i = 0; i < questionsReq.length; i++) {
        const question = questionsReq[i]
        const questionModel = new Question(undefined, question.description, question.type)
        questionsModels.push(questionModel)
      }
      const questionList = new QuestionList(undefined, title, admin, undefined, questionsModels, true)
      QuestionListDAO.saveQuestionList(questionList).then((success) => {
        if (success) {
          return ApiResponse.successResponse({ saved: true }, res)
        } else {
          return ApiResponse.errorResponse(500, 'Could not save questionlist', res)
        }
      }).catch((ignore) => {
        return ApiResponse.errorResponse(500, 'Could not save questionlist', res)
      })
    } else {
      console.log(errorMessage)
      return ApiResponse.errorResponse(400, errorMessage, res)
    }
  }

  static editQuestionList (req, res, next) {
    const id = req.body.id
    const admin = req.user
    const title = req.body.title
    const questionsReq = req.body.questions

    const questionsModels = []

    const errorMessage = QuestionListCheck.questionListCheck(title, questionsReq)
    QuestionListDAO.getQuestionListById(id).then((questionList) => {
      if (questionList === undefined) {
        return ApiResponse.errorResponse(404, 'Question list not found', res)
      } else {
        if (errorMessage === undefined) {
          for (let i = 0; i < questionsReq.length; i++) {
            const question = questionsReq[i]
            const questionModel = new Question(undefined, question.description, question.type)
            questionsModels.push(questionModel)
          }
          const questionList = new QuestionList(undefined, title, admin, undefined, questionsModels, true)
          QuestionListDAO.updateQuestionList(id, questionList).then((success) => {
            if (success) {
              return ApiResponse.successResponse({ saved: true }, res)
            } else {
              return ApiResponse.errorResponse(500, 'Could not save questionlist', res)
            }
          }).catch((ignore) => {
            return ApiResponse.errorResponse(500, 'Could not save questionlist', res)
          })
        } else {
          return ApiResponse.errorResponse(400, errorMessage, res)
        }
      }
    })
  }
}
