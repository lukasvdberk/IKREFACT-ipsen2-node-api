const UserDAO = require('../dao/userDAO')
const ApiResponse = require('./utils/apiResponse')

module.exports = class UserController {
  /**
   * Gets all registered users.
   * @function
   * @returns {json} - response
   */
  static allUsers (req, res, next) {
    UserDAO.getUsers().then(users => {
      return ApiResponse.successResponse(users, res)
    }).catch(e => {
      return ApiResponse.errorResponse(500, 'Could not get users', res)
    })
  }

  /**
   * Gives a specific user admin permissions.
   * @function
   * @returns {json} - Returns a response in json format.
   */
  static changeUserToAdmin (req, res, next) {
    const username = req.body.username
    if (!username) {
      return ApiResponse.errorResponse(400, 'You did not supply a username', res)
    }
    UserDAO.getUserByUsername(username).then((user) => {
      if (user === undefined) {
        return ApiResponse.errorResponse(400, 'User not found', res)
      } else {
        UserDAO.makeUserAdmin(user.getId).then((success) => {
          return ApiResponse.successResponse({}, res)
        }).catch((ignored) => {
          return ApiResponse.errorResponse(500, 'Failed to make user admin', res)
        })
      }
    })
  }

  /**
   * Revokes admin privileges from a specific user.
   * @function
   * @returns {json} - Returns a response in json format.
   */
  static changeAdminToUser (req, res, next) {
    const username = req.body.username
    UserDAO.getUserByUsername(username).then((user) => {
      if (user === undefined) {
        return ApiResponse.errorResponse(400, 'User not found', res)
      } else {
        UserDAO.makeAdminUser(user.getId).then((success) => {
          return ApiResponse.successResponse({}, res)
        }).catch((ignored) => {
          return ApiResponse.errorResponse(500, 'Failed to make admin to user', res)
        })
      }
    })
  }
}
