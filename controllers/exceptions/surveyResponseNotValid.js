module.exports = class SurveyValidNotValid extends Error {
  constructor (message) {
    super(message)
    this.name = 'SurveyValidNotValid'
  }
}
