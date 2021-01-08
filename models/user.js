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
}
