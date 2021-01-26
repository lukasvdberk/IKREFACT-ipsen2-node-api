const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const Admin = require('../models/admin')
const ApiResponse = require('../controllers/utils/apiResponse')

const JWT_ALGORITHM = 'HS256'
module.exports = class AuthorizationUtil {
  /**
   * Hashes password.
   * @function
   * @param {string} password - The password you want to hash.
   * @returns {Object} with {salt, passwordHash}
   */
  static async hashPassword (password) {
    const randomLength = Math.random() * 16
    const salt = bcrypt.genSaltSync(randomLength)

    return bcrypt.hash(password, salt)
  }

  /**
   * Checks is valid password
   * @function
   * @param {string} password - The password in plain text
   * @param {string} hash - The hash you want to compare to the password (likely coming from a database)
   * @returns {boolean} Success or not
   */
  static async comparePasswordHashAgainstPlainPassword (password, hash) {
    return bcrypt.compare(password, hash)
  }

  static getJWTKey () {
    return process.env.JWT_SECRET_KEY
  }

  /**
   * Creates a jwt key
   * @function
   * @param {Number} userId - User his id (likely coming from the database)
   * @param {string} username - User his username
   * @param {boolean} isAdmin - Wheather the user is admin or not
   * @returns {string} - The generated jwt token
   */
  static createJWT (userId, username, isAdmin) {
    return jwt.sign({ userId, username, isAdmin }, this.getJWTKey(), {
      algorithm: JWT_ALGORITHM
    })
  }

  /**
   * Extracts information from JWT-key
   * @function
   * @returns {Object} - {userId,username,isAdmin} or undefined if the key is not valid
   */
  static extractJWTInformation (jwtToken) {
    const payload = jwt.verify(jwtToken, this.getJWTKey(), {
      algorithm: JWT_ALGORITHM
    })

    return {
      userId: payload.userId,
      username: payload.username,
      isAdmin: payload.isAdmin
    }
  }

  /**
   *
   * @param {express.Request} req - The express request object that should contain the authorization header.
   * @returns {String} -  Jwt key
   * @private
   */
  static _extractToken (req) {
    return req.header('Bearer-token')
  }

  /**
   * Check whether user is authenticated as a user. Receives standard express objects and calls next with success.
   * sets user model in req.user
   * @function
   */
  static isAuthenticatedAsUser (req, res, next) {
    try {
      const jwtToken = AuthorizationUtil._extractToken(req)

      const jwtPayload = AuthorizationUtil.extractJWTInformation(jwtToken)
      // so you can use get user who made the request in the endpoint
      // since it will receive the same req object
      req.user = new User(jwtPayload.userId, jwtPayload.username)
      return next()
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(403, 'Not authenticated', res)
    }
  }

  /**
   * Check whether user is authenticated as a admin. Receives standard express objects and calls next with success.
   * sets user model in req.user and req.isAdmin
   * @function
   */
  static isAuthenticatedAsAdmin (req, res, next) {
    try {
      const jwtToken = AuthorizationUtil._extractToken(req)

      const jwtPayload = AuthorizationUtil.extractJWTInformation(jwtToken)
      const isAdmin = jwtPayload.isAdmin

      if (isAdmin) {
        // so you can use get user who made the request in the endpoint
        // since it will receive the same req object
        req.user = new Admin(jwtPayload.userId, jwtPayload.username)

        return next()
      } else {
        return ApiResponse.sendErrorApiResponse(403, 'Not a admin', res)
      }
    } catch (ignored) {
      return ApiResponse.sendErrorApiResponse(403, 'Not authenticated', res)
    }
  }
}
