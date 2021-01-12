const express = require('express')
const AuthorizationUtil = require('../util/auhtorizationUtil')
const SurveyResponseController = require('../controllers/surveyResponseController')

const router = express.Router()

router.get('/', AuthorizationUtil.isAuthenticatedAsUser, SurveyResponseController.surveyResponsesFromUser)
router.get('/:questionListId', AuthorizationUtil.isAuthenticatedAsUser, SurveyResponseController.getSurveyResponseById)
router.post('/', AuthorizationUtil.isAuthenticatedAsUser, SurveyResponseController.saveSurveyResponse)
router.post('/finalize', AuthorizationUtil.isAuthenticatedAsUser, SurveyResponseController.editSurveyResponseAndMarkAsDone)

module.exports = router
