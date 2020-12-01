const express = require('express')
const AuthorizationUtil = require('../util/auhtorizationUtil')
const QuestionListController = require('../controllers/questionListController')

const router = express.Router()

router.get('/:questionListId', AuthorizationUtil.isAuthenticatedAsUser, QuestionListController.questionListById)
router.get('/', AuthorizationUtil.isAuthenticatedAsUser, QuestionListController.questionList)
router.post('/', AuthorizationUtil.isAuthenticatedAsAdmin, QuestionListController.saveQuestionList)
router.post('/edit', AuthorizationUtil.isAuthenticatedAsAdmin, QuestionListController.editQuestionList)

module.exports = router
