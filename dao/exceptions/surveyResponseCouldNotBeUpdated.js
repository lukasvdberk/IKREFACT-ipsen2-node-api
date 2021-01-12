module.exports = class SurveyResponseCouldNotBeUpdated extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyResponseCouldNotBeUpdated'
  }
}
