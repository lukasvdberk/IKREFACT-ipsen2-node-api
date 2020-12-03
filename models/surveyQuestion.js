module.exports = class SurveyQuestion {
  /**
   * SurveyQuestion constructor for survey question model
   * @constructor
   * @param {Number} id - Database id
   * @param {string} description - The question in plain text
   * @param {string} type - Which type of question. can be FILE or TEXT
   */
  constructor (id, description, type) {
    this.id = id
    this.description = description
    this.type = type
  }

  get getId () {
    return this.id
  }

  get getDescription () {
    return this.description
  }

  get getType () {
    return this.type
  }
}
