module.exports = class File {
  constructor (id, answerId, path, checksum, content) {
    this.id = id
    this.answerId = answerId
    this.path = path
    this.content = content
  }
}
