const AuthorizationUtil = require('../util/auhtorizationUtil')
const UserDAO = require('../dao/userDAO')
const User = require('../models/user')
const ApiResponse = require('./utils/apiResponse')
const UserUtil = require('./utils/userUtil')

module.exports = class AuthorizationController {
  static async login (req, res, next) {
    const userFromRequestBody = UserUtil.requestBodyToUserModel(req)

    const userFromDatabase = await UserDAO.getUserByUsername(userFromRequestBody.username)
    if (userFromDatabase !== undefined) {
      const validPassword = await AuthorizationUtil.validPassword(userFromRequestBody.password, userFromDatabase.hashPassword)
      if (validPassword) {
        const isUserAdmin = await UserDAO.isUserAdmin(new User(userFromDatabase.getId, userFromDatabase.getUsername))
        const token = AuthorizationUtil.createJWT(userFromDatabase.getId, userFromRequestBody.getUsername, isUserAdmin)

        return ApiResponse.sendSuccessApiResponse({
          key: token,
          isAdmin: isUserAdmin
        }, res)
      } else {
        return ApiResponse.sendErrorApiResponse(403, 'Invalid password', res)
      }
    } else {
      return ApiResponse.sendErrorApiResponse(404, 'User not found', res)
    }
  }

  static async register (req, res, next) {
    const user = UserUtil.requestBodyToUserModel(req)

    if (!user) {
      return ApiResponse.sendErrorApiResponse(400, 'Username or password not supplied', res)
    }

    const hashedPassword = await AuthorizationUtil.hashPassword(user.password)
    const userObj = UserDAO.getUserByUsername(user.username)
    if (userObj === undefined) {
      UserDAO.saveUser(user, hashedPassword).then((success) => {
        if (success) {
          UserDAO.getUserByUsername(user.username).then((user) => {
            return ApiResponse.sendSuccessApiResponse({
              key: AuthorizationUtil.createJWT(user.getId, user.getUsername, false),
              isAdmin: false
            }, res)
          })
        }
      })
    } else {
      return ApiResponse.sendErrorApiResponse(303, 'User with the given username already exists', res)
    }
  }
}
