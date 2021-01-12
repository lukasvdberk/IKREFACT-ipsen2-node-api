module.exports = class UserCouldNotBeFound extends Error {
  constructor (message) {
    super(message)
    this.name = 'UserCouldNotBeFound'
  }
}
