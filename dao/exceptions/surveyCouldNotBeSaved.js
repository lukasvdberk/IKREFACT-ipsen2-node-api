module.exports = class SurveyCouldNotBeSaved extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyCouldNotBeSaved'
  }
}
