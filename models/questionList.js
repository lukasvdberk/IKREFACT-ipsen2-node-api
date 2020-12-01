module.exports = class QuestionList {
  /**
   * Answer constructor for answer model
   * @constructor
   * @param {Number} id - Database id
   * @param {string} title - Title of the list of quetions
   * @param {Admin} madeBy - A admin model of who created this
   * @param {createdOn} createdOn
   * @param {Question[]} questions - Array of question models that belong to this question list
   * @param {boolean} isActive - Wheather the questionlist is still used or not
   */
  constructor (id, title, madeBy, createdOn, questions, isActive) {
    this.id = id
    this.title = title
    this.madeBy = madeBy
    this.createdOn = createdOn
    this.questions = questions
    this.isActive = isActive
  }

  get getId () {
    return this.id
  }

  get getTitle () {
    return this.title
  }

  get getMadeBy () {
    return this.madeBy
  }

  get getCreatedOn () {
    return this.createdOn
  }

  /**
   * @returns {Question[]} questions - Array of question models that belong to this question list
   */
  get getQuestions () {
    return this.questions
  }

  get getIsActive () {
    return this.isActive
  }
}
