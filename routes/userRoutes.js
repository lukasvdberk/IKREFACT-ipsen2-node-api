const express = require('express')
const AuthorizationUtil = require('../util/auhtorizationUtil')
const UserController = require('../controllers/userController')

const router = express.Router()

router.get('/all', AuthorizationUtil.isAuthenticatedAsAdmin, UserController.allUsers)
router.post('/make-admin', AuthorizationUtil.isAuthenticatedAsAdmin, UserController.changeUserToAdmin)
router.delete('/make-user/', AuthorizationUtil.isAuthenticatedAsAdmin, UserController.changeAdminToUser)

module.exports = router
