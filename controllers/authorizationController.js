const AuthorizationUtil = require('../util/auhtorizationUtil')
const UserDAO = require('../dao/userDAO')
const User = require('../models/user')
const ApiResponse = require('./utils/apiResponse')

module.exports = class AuthorizationController {
  static login (req, res, next) {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return ApiResponse.errorResponse(400, 'Username or password not supplied', res)
    }

    UserDAO.getUserByUsername(username).then((user) => {
      if (user !== undefined) {
        AuthorizationUtil.validPassword(password, user.hashPassword).then((validPassword) => {
          if (validPassword) {
            UserDAO.isUserAdmin(new User(user.getId, user.getUsername)).then((isUserAdmin) => {
              const token = AuthorizationUtil.createJWT(user.getId, user.getUsername, isUserAdmin)

              return ApiResponse.successResponse({
                key: token,
                isAdmin: isUserAdmin
              }, res)
            })
          } else {
            return ApiResponse.errorResponse(403, 'Invalid password', res)
          }
        })
      } else {
        return ApiResponse.errorResponse(404, 'User not found', res)
      }
    })
  }

  static register (req, res, next) {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return ApiResponse.errorResponse(404, 'Username or password not supplied', res)
    }
    AuthorizationUtil.hashPassword(password).then((hashedPassword) => {
      // 0 because the id is not defined yet
      const user = new User(0, username)

      UserDAO.getUserByUsername(username).then((userObj) => {
        // undefined means not found
        if (userObj === undefined) {
          UserDAO.saveUser(user, hashedPassword).then((success) => {
            if (success) {
              UserDAO.getUserByUsername(username).then((user) => {
                return ApiResponse.successResponse({
                  key: AuthorizationUtil.createJWT(user.getId, user.getUsername, false),
                  isAdmin: false
                }, res)
              })
            }
          })
        } else {
          return ApiResponse.errorResponse(303, 'User with the given username already exists', res)
        }
      })
    })
  }
}
