module.exports = class SurveyResponseNotFoundException extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyResponseNotFoundException'
  }
}
