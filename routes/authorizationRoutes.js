const express = require('express')
const AuthorizationController = require('../controllers/authorizationController')

const router = express.Router()

router.post('/login', AuthorizationController.login)
router.post('/register', AuthorizationController.register)

module.exports = router
