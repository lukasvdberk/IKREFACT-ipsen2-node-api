const AuthorizationUtil = require('../util/auhtorizationUtil')
const UserDAO = require('../dao/userDAO')
const User = require('../models/user')
const ApiResponse = require('./utils/apiResponse')
const UserUtil = require('./utils/userUtil')

module.exports = class AuthorizationController {
  static login (req, res, next) {
    const userFromRequestBody = UserUtil.requestBodyToUserModel(req)

    if (!userFromRequestBody) {
      return ApiResponse.sendErrorApiResponse(400, 'Username or password not supplied', res)
    }

    UserDAO.getUserByUsername(userFromRequestBody.username).then((userFromDatabase) => {
      if (userFromDatabase !== undefined) {
        AuthorizationUtil.validPassword(userFromRequestBody.password, userFromDatabase.hashPassword).then((validPassword) => {
          if (validPassword) {
            UserDAO.isUserAdmin(new User(userFromDatabase.getId, userFromDatabase.getUsername)).then((isUserAdmin) => {
              const token = AuthorizationUtil.createJWT(userFromDatabase.getId, userFromRequestBody.getUsername, isUserAdmin)

              return ApiResponse.sendSuccessApiResponse({
                key: token,
                isAdmin: isUserAdmin
              }, res)
            })
          } else {
            return ApiResponse.sendErrorApiResponse(403, 'Invalid password', res)
          }
        })
      } else {
        return ApiResponse.sendErrorApiResponse(404, 'User not found', res)
      }
    })
  }

  static register (req, res, next) {
    const user = UserUtil.requestBodyToUserModel(req)

    if (!user) {
      return ApiResponse.sendErrorApiResponse(400, 'Username or password not supplied', res)
    }

    AuthorizationUtil.hashPassword(user.password).then((hashedPassword) => {
      UserDAO.getUserByUsername(user.username).then((userObj) => {
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
      })
    })
  }
}
