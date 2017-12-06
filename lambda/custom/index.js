/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
const Alexa = require('alexa-sdk');
const Moment = require('moment');

//=========================================================================================================================================
//TODO: The items below this comment need your attention.
//=========================================================================================================================================

//Replace with your app ID (OPTIONAL).  You can find this value at the top of your skill's page on http://developer.amazon.com.
//Make sure to enclose your value in quotes, like this: const APP_ID = 'amzn1.ask.skill.bb4045e6-b3e8-4133-b650-72923c5980f1';
const APP_ID = undefined;

const SKILL_NAME = 'School Clubs';
const GET_FACT_MESSAGE = "Here's your clubs: ";
const HELP_MESSAGE = 'You can say tell me a school club, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';

const data = [
    'There is an archery club on wednesday at 3 o\'clock.',
    'There is a bowling club on tuesday at 4 o\'clock.',
    'There is a fight club on friday at 9 o\'clock.',
    'There is a dungeons and dragons club on monday at 2 o\'clock.',
    'There is a swim club on thursday at 6 o\'clock.'
];


AWS.config.update({
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
var docClient = new AWS.DynamoDB.DocumentClient();

const tableName = "SchoolClubs";

exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.appId = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const handlers = {
    'LaunchRequest': function () {
        this.emit('GetClubsForDayIntent');
    },
    'GetClubsForDayIntent': function (day) {
        const clubArr = data;
        const factIndex = Math.floor(Math.random() * clubArr.length);
        const randomFact = clubArr[factIndex];
        const speechOutput = GET_FACT_MESSAGE + randomFact;

        this.response.cardRenderer(SKILL_NAME, randomFact);
        this.response.speak(speechOutput);
        this.emit(':responseReady');
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = HELP_MESSAGE;
        const reprompt = HELP_REPROMPT;

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
};

// callback(error, clubs)
// defaults to today
var getClubsForDay = function(theDay, callback) {
  var day = (day == null) ? moment().format('dddd').toLowerCase() : theDay;

  var params = {
    TableName: tableName,
    FilterExpression: "#day = :day",
    ExpressionAttributeNames: {
      "#day": "day",
    },
    ExpressionAttributeValues: {
      ":day": day
    }
  };

  docClient.scan(params, function(error, data) {
    if (error) {
      callback(error);
    } else {
      callback(null, data.Items);
    }
  });
}
