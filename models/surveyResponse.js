module.exports = class SurveyResponse {
  /**
   * SurveyResponse constructor for SurveyResponse model
   * @constructor
   * @param {Number} id - Database id
   * @param {User} filledByUser - User model for which user answered the questions
   * @param {string} finishedOn - Date of when it was finished
   * @param {Answer[]} answers - Array of Answer models
   */
  constructor (id, filledByUser, finishedOn, answers) {
    this.id = id
    this.filledByUser = filledByUser
    this.finishedOn = finishedOn
    this.answers = answers
  }
}
