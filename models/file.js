const FileHelper = require('../util/FileHelper')
const { v4: uuidv4 } = require('uuid')

module.exports = class File {
  constructor (id, answerId, path, checksum, content) {
    this._id = id
    this._answerId = answerId
    this._path = path
    this._checksum = checksum
    this._content = content
  }

  /**
   * Use this when creating a new file. This will generate a checksum and a unique filename.
   * @param answerId
   * @param filename
   * @param content
   * @returns {File}
   */
  static saveFileAsAnswer (answerId, filename, content) {
    const savePath = process.env.FILE_SAVE_PATH
    const extension = FileHelper.getExtensionFromFilename(filename)
    const uuid = uuidv4()
    const path = `${savePath}${uuid}.${extension}`
    const checksum = FileHelper.generateChecksum(content)
    return new File(undefined, answerId, path, checksum, content)
  }

  get id () {
    return this._id
  }

  set id (value) {
    this._id = value
  }

  get answerId () {
    return this._answerId
  }

  set answerId (value) {
    this._answerId = value
  }

  get path () {
    return this._path
  }

  set path (value) {
    this._path = value
  }

  get checksum () {
    return this._checksum
  }

  set checksum (value) {
    this._checksum = value
  }

  get content () {
    return this._content
  }

  set content (value) {
    this._content = value
  }

  validateChecksum () {
    return this.checksum === FileHelper.generateChecksum(this.content)
  }
}
