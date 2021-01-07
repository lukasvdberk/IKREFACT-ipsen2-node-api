const UserDAO = require('../dao/userDAO')
const ApiResponse = require('./utils/apiResponse')

module.exports = class UserController {
  /**
   * Gets all registered users.
   * @function
   * @returns {json} - response
   */
  static async allUsers (req, res, next) {
    try {
      const users = await UserDAO.getUsers()
      return ApiResponse.sendSuccessApiResponse(users, res)
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Could not get users', res)
    }
  }

  /**
   * Gives a specific user admin permissions.
   * @function
   * @returns {json} - Returns a response in json format.
   */
  static async changeUserToAdmin (req, res, next) {
    try {
      const username = req.body.username
      if (!username) {
        return ApiResponse.sendErrorApiResponse(400, 'You did not supply a username', res)
      }
      const user = await UserDAO.getUserByUsername(username)
      if (user === undefined) {
        return ApiResponse.sendErrorApiResponse(400, 'User not found', res)
      } else {
        const userIsUpdated = await UserDAO.makeUserAdmin(user.getId)
        if (userIsUpdated) {
          return ApiResponse.sendSuccessApiResponse({}, res)
        }
      }
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to make user admin', res)
    }
  }

  /**
   * Revokes admin privileges from a specific user.
   * @function
   * @returns {json} - Returns a response in json format.
   */
  static async changeAdminToUser (req, res, next) {
    try {
      const username = req.body.username
      const user = UserDAO.getUserByUsername(username)
      if (user === undefined) {
        return ApiResponse.sendErrorApiResponse(400, 'User not found', res)
      } else {
        const userIsUpdated = await UserDAO.makeAdminUser(user.getId)
        if (userIsUpdated) {
          return ApiResponse.sendSuccessApiResponse({}, res)
        }
      }
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(500, 'Failed to make admin to user', res)
    }
  }
}
