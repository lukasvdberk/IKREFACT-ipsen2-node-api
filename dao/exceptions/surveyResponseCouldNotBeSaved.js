module.exports = class SurveyResponseCouldNotBeSaved extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyResponseCouldNotBeSaved'
  }
}
