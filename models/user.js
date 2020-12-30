module.exports = class User {
  /**
 * user constructor for user model
 * @constructor
 * @param {Number} id - User id from database
 * @param {String} username - Username from user
 */
  constructor (id, username) {
    this.id = id
    this.username = username
  }

  get getId () {
    return this.id
  }

  get getUsername () {
    return this.username
  }

  set hashedPassword (password) {
    this._hashedPassword = password
  }

  get hashedPassword () {
    return this._hashedPassword
  }
}
