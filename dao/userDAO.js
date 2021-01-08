const Database = require('./database')
const User = require('../models/user')

module.exports = class UserDAO {
  /**
  * Saves user in database with hashedpassword
  * @function
  * @param {user} User - Needs to be a valid User model
  * @param {string} hashedPassword - The hashed password
  * @returns {boolean} - if succes or not
  */
  static async saveUser (user, hashedPassword) {
    const queryResult = await Database.executeSQLStatement(
      'INSERT INTO "User"(username, password) VALUES($1,$2)',
      user.username, hashedPassword
    )

    return queryResult.rowCount === 1
  }

  static async updateUser (existingUserId, updatedUser) {

  }

  /**
  * Checks if user with given username already exists in the database
  * @function
  * @param {string} username - The username you want to check
  * @returns {User} - If found returns user object or else undefined
  */
  static async getUserByUsername (username) {
    const userQueryResult = await Database.executeSQLStatement(
      'SELECT * FROM "User" WHERE username=$1', username
    )

    if (userQueryResult.rowCount > 0) {
      const row = userQueryResult.rows[0]
      const user = new User(row.userid, row.username)
      user.hashPassword = row.password

      return user
    }

    return undefined
  }

  /**
  * Places a user into the admin table in the database.
  * @function
  * @param {string} userId - Id of the user you want to make admin
  */
  static async makeUserAdmin (userId) {
    const queryResult = await Database.executeSQLStatement(
      'INSERT INTO "adminuser"(userid) VALUES($1)', userId
    )

    return queryResult.rowCount === 1
  }

  /**
  * Removes a user from the admin table in the database.
  * @function
  * @param {string} userId - Id of the user you want to make admin
  */
  static async makeAdminUser (userId) {
    const queryResult = await Database.executeSQLStatement(
      'Delete FROM adminuser WHERE adminuser.userid = $1', userId
    )

    return queryResult.rowCount === 1
  }

  /**
  * Check if user is admin
  * @function
  * @param {User} user - The user model you want check
  * @returns {boolean} - if succes or not
  */
  static async isUserAdmin (user) {
    const queryResult = await Database.executeSQLStatement(
      'SELECT * FROM adminuser WHERE userid=$1', user.getId
    )

    return queryResult.rowCount > 0
  }

  /**
   * Get all users
   * @returns {Promise<User[]>}
   */
  static async getUsers () {
    const queryResult = await Database.executeSQLStatement(
      'SELECT "User".username,"User".userid, adminuserid ' +
      'FROM "User" ' +
      'LEFT JOIN adminuser ON "User".userid = adminuser.userid'
    )

    return queryResult.rows.map(user => new User(user.adminuserid, user.username))
  }
}
