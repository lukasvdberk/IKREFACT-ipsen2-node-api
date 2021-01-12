module.exports = class SurveyNotFoundException extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyNotFoundException'
  }
}
