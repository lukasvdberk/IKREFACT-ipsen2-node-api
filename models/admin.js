const User = require('./user')

module.exports = class Admin extends User {
  constructor (id, username) {
    super(id, username)
  }
}
