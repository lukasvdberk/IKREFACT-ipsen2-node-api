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

  /**
   * SurveyResponse constructor for SurveyResponse model
   * @get
   * @returns {Number} id - Database id
   */
  get getId () {
    return this.id
  }

  /**
   * SurveyResponse constructor for SurveyResponse model
   * @get
   * @return {User} filledByUser - User model for which user answered the questions
   */
  get getFilledByUser () {
    return this.filledByUser
  }

  get getFinishedOn () {
    return this.finishedOn
  }

  /**
   * SurveyResponse constructor for SurveyResponse model
   * @get
   * @returns {Answer[]} answers - Array of Answer models
   */
  get getAnswers () {
    return this.answers
  }

  /**
   * SurveyResponse constructor for SurveyResponse model
   * @get
   * @returns {boolean} wheather it the questionlist was finished or not
   */
  get getIsFinished () {
    return this.finishedOn !== undefined
  }
}
