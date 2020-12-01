CREATE TABLE "User"
(
   userId SERIAL,
   username TEXT NOT NULL,
   password TEXT NOT NULL,
   PRIMARY KEY (userId)
);

CREATE TABLE AdminUser
(
    adminUserId SERIAL,
    userId SERIAL NOT NULL UNIQUE,

    PRIMARY KEY (adminUserId),
    FOREIGN KEY (userId) REFERENCES  "User"(userId)
);

CREATE TABLE AnswerList
(
    answerListId SERIAL,
    finishedOn TIMESTAMP,
    filledByUser SERIAL NOT NULL,
    PRIMARY KEY (answerListId),
    FOREIGN KEY (filledByUser) REFERENCES  "User"(userId)
);

CREATE TABLE QuestionList
(
    questionListId SERIAL,
    title TEXT,
    madeByAdmin SERIAL NOT NULL,
    createdOn TIMESTAMP,
    isActive BOOLEAN,
    PRIMARY KEY (questionListId),
    FOREIGN KEY (madeByAdmin) REFERENCES  AdminUser(adminUserId)
);

CREATE TABLE Question
(
    questionId SERIAL,
    questionIdListId SERIAL,
    question TEXT,
    questionType TEXT,
    PRIMARY KEY (questionId),
    FOREIGN KEY (questionIdListId) REFERENCES  QuestionList(questionListId)
);

CREATE TABLE Answer
(
    answerId SERIAL,
    questionId SERIAL,
    answerListId SERIAL,
    answer TEXT,
    PRIMARY KEY (answerId),
    FOREIGN KEY (questionId) REFERENCES  Question(questionId) ,
    FOREIGN KEY (answerListId) REFERENCES  AnswerList(answerListId)
);

CREATE TABLE FileAnswer
(
    fileId SERIAL,
    answerId SERIAL,
    filePath TEXT,
    checkSum TEXT,
    PRIMARY KEY (fileId),
    FOREIGN KEY (answerId) REFERENCES  Answer(answerId)
);