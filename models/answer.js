module.exports = class Answer {
  /**
   * Answer constructor for answer model
   * @constructor
   * @param {Question} question - The question model which this objects answers
   * @param {string} textAnswer - Answer to question in text form
   * @param {File[]} fileArray - Array of files
   */
  constructor (question, textAnswer, fileArray) {
    this.question = question
    this.textAnswer = textAnswer
    this.fileArray = fileArray
  }

  /**
   * @get
   * @return {Question} question - The question model which this objects answers
   */
  get getQuestion () {
    return this.question
  }

  get getTextAnswer () {
    return this.textAnswer
  }

  get getFileArray () {
    return this.fileArray
  }
}
