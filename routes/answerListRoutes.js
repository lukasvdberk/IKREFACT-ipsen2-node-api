const express = require('express')
const AuthorizationUtil = require('../util/auhtorizationUtil')
const AnswerListController = require('../controllers/answerListController')

const router = express.Router()

router.get('/', AuthorizationUtil.isAuthenticatedAsUser, AnswerListController.answerLists)
router.get('/:questionListId', AuthorizationUtil.isAuthenticatedAsUser, AnswerListController.answerListByIdSurveyId)
router.post('/', AuthorizationUtil.isAuthenticatedAsUser, AnswerListController.saveAnswerList)
router.post('/finalize', AuthorizationUtil.isAuthenticatedAsUser, AnswerListController.finalizeAnswerList)
router.post('/add-file-to-answer', AuthorizationUtil.isAuthenticatedAsUser, AnswerListController.addFileToAnswer)

module.exports = router
