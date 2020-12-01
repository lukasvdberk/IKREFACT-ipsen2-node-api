const crypto = require('crypto')

module.exports = class FileHelper {
  /**
   * Get the extension of a file with its filename
   * @param filename
   * @returns string
   */
  static getExtensionFromFilename (filename) {
    return /(?:\.([^.]+))?$/.exec(filename)[1]
  }

  /**
   * Generate a checksum for a file/string
   * https://gist.github.com/zfael/a1a6913944c55843ed3e999b16350b50
   * @param str
   * @param algorithm
   * @param encoding
   * @returns {string}
   */
  static generateChecksum (str, algorithm, encoding) {
    return crypto
      .createHash(algorithm || 'md5')
      .update(str, 'utf8')
      .digest(encoding || 'hex')
  }
}
