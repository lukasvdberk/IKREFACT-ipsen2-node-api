const User = require('../../models/user')

module.exports = class UserUtil {
  static requestBodyToUserModel (req) {
    const id = req.body.id
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return undefined
    }
    const user = new User(id, username)
    user.password = password
    return user
  }
}
