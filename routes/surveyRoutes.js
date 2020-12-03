const express = require('express')
const AuthorizationUtil = require('../util/auhtorizationUtil')
const SurveyController = require('../controllers/surveyController')

const router = express.Router()

router.get('/:questionListId', AuthorizationUtil.isAuthenticatedAsUser, SurveyController.surveyById)
router.get('/', AuthorizationUtil.isAuthenticatedAsUser, SurveyController.getSurveys)
router.post('/', AuthorizationUtil.isAuthenticatedAsAdmin, SurveyController.saveSurvey)
router.post('/edit', AuthorizationUtil.isAuthenticatedAsAdmin, SurveyController.editSurvey)

module.exports = router
