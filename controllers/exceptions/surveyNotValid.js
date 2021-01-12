module.exports = class SurveyNotValid extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyNotValidException'
  }
}
