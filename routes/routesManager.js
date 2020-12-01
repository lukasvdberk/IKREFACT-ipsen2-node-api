const express = require('express')
const answerListRouter = require('./answerListRoutes')
const authorizationRoutes = require('./authorizationRoutes')
const questionListRoutes = require('./questionListRoutes')
const userRoutes = require('./userRoutes')

const router = express.Router()

router.use('/auth/', authorizationRoutes)
router.use('/answer-list/', answerListRouter)
router.use('/question-list/', questionListRoutes)
router.use('/user/', userRoutes)

module.exports = router
