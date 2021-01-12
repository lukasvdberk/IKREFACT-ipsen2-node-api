const UserDAO = require('../dao/userDAO')
const ApiResponse = require('./utils/apiResponse')
const UserCouldNotBeFound = require('../dao/exceptions/userCouldNotBeFound')

module.exports = class UserController {
  /**
   * Gets all registered users.
   * @function
   * @returns {json} - response
   */
  static async allUsers (req, res) {
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
  static async changeUserToAdmin (req, res) {
    try {
      const username = req.body.username
      const user = await UserDAO.getUserByUsername(username)

      await UserDAO.upgradeUserToAdminRole(user.id)

      return ApiResponse.sendSuccessApiResponse({}, res)
    } catch (exception) {
      if (exception instanceof UserCouldNotBeFound) {
        return ApiResponse.sendErrorApiResponse(400, 'User not found', res)
      } else {
        return ApiResponse.sendErrorApiResponse(500, 'Failed to make user admin', res)
      }
    }
  }

  /**
   * Revokes admin privileges from a specific user.
   * @function
   * @returns {json} - Returns a response in json format.
   */
  static async changeAdminToUser (req, res) {
    try {
      const username = req.body.username
      const user = await UserDAO.getUserByUsername(username)

      await UserDAO.downgradeAdminToUserRole(user.id)

      return ApiResponse.sendSuccessApiResponse({}, res)
    } catch (exception) {
      if (exception instanceof UserCouldNotBeFound) {
        return ApiResponse.sendErrorApiResponse(400, 'User not found', res)
      } else {
        return ApiResponse.sendErrorApiResponse(500, 'Failed to make admin to user', res)
      }
    }
  }
}
