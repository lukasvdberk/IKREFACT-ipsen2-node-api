const express = require('express')
const surveyResponseRouter = require('./surveyResponseRoutes')
const authorizationRoutes = require('./authorizationRoutes')
const surveyRoutes = require('./surveyRoutes')
const userRoutes = require('./userRoutes')

const router = express.Router()

router.use('/auth/', authorizationRoutes)
router.use('/answer-list/', surveyResponseRouter)
router.use('/question-list/', surveyRoutes)
router.use('/user/', userRoutes)

module.exports = router
