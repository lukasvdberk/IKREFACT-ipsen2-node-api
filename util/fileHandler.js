const fs = require('fs').promises
const Cryptr = require('cryptr')

const cryptr = new Cryptr(process.env.FILE_ENCRYPTION_KEY)

module.exports = class FileHandler {
  static getFileContents (path) {
    return cryptr.decrypt(fs.readFile(path))
  }

  static saveFile (file) {
    return cryptr.encrypt(fs.writeFile(file.path, file.content))
  }
}
