const AuthorizationUtil = require('../util/auhtorizationUtil')
const UserDAO = require('../dao/userDAO')
const User = require('../models/user')
const ApiResponse = require('./utils/apiResponse')
const UserCouldNotBeFound = require('../dao/exceptions/userCouldNotBeFound')
const UserCouldNotBeSaved = require('../dao/exceptions/userCouldNotBeSaved')

module.exports = class AuthorizationController {
  static async login (req, res) {
    const userFromRequestBody = AuthorizationController._requestBodyToUserModel(req)

    try {
      const userFromDatabase = await UserDAO.getUserByUsername(userFromRequestBody.username)
      const validPassword = await AuthorizationUtil.comparePasswordHashAgainstPlainPassword(userFromRequestBody.password, userFromDatabase.hashPassword)

      if (validPassword) {
        const isUserAdmin = await UserDAO.isUserAdmin(userFromDatabase)
        const token = AuthorizationUtil.createJWT(userFromDatabase.id, userFromRequestBody.username, isUserAdmin)

        return ApiResponse.sendSuccessApiResponse({
          key: token,
          isAdmin: isUserAdmin
        }, res)
      } else {
        return ApiResponse.sendErrorApiResponse(403, 'Invalid password', res)
      }
    } catch (exception) {
      if (exception instanceof UserCouldNotBeFound) {
        return ApiResponse.sendErrorApiResponse(404, 'User not found', res)
      }
    }
  }

  static async register (req, res) {
    try {
      const user = AuthorizationController._requestBodyToUserModel(req)

      if (!user) {
        return ApiResponse.sendErrorApiResponse(400, 'Username or password not supplied', res)
      }

      await UserDAO.getUserByUsername(user.username)
      return ApiResponse.sendErrorApiResponse(303, 'User with the given username already exists', res)
    } catch (exception) {
      // This is the expected behaviour. The reason for the in the catch block is
      // because UserDAO.getUserByUsername throws UserCouldNotBeFound
      if (exception instanceof UserCouldNotBeFound) {
        const user = AuthorizationController._requestBodyToUserModel(req)

        const hashedPassword = await AuthorizationUtil.hashPassword(user.password)
        await UserDAO.saveUser(user, hashedPassword)

        return ApiResponse.sendSuccessApiResponse({
          key: AuthorizationUtil.createJWT(user.id, user.username, false),
          isAdmin: false
        }, res)
      }
      if (exception instanceof UserCouldNotBeSaved) {
        // not the right error message but since it is a refactor the functionality can't change on the outside.
        return ApiResponse.sendErrorApiResponse(303, 'User with the given username already exists', res)
      }
    }
  }

  static _requestBodyToUserModel (req) {
    const id = req.body.id
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return undefined
    }
    const user = new User(id, username)
    user.password = password
    return user
  }
}
