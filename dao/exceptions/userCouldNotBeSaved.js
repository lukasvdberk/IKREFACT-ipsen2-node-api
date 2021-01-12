module.exports = class UserCouldNotBeSaved extends Error {
  constructor (message) {
    super(message)
    this.name = 'UserCouldNotBeSaved'
  }
}
