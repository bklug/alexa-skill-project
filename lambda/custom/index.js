'use strict';
const Alexa = require('alexa-sdk');
const Moment = require('moment');
AWS.config.update({
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY
});
const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "SchoolClubs";


const APP_ID = undefined;
const SKILL_NAME = 'School Clubs';
const HELP_MESSAGE = 'You can say tell me a school club, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';
const NO_CLUBS_MESSAGE = 'Sorry, there are were no clubs matching your criteria!';


exports.handler = function(event, context, callback) {
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    this.response.speak("What would you like to know about our school clubs at BCIT?").listen(reprompt);
    this.emit('GetClubsForDayIntent');
  },
  'GetClubsForDayIntent': function() {
    const date = this.event.request.intent.slots.day.value;
    const day = moment(date).format('dddd');

    getClubsForDay(day, function(error, clubs) {
      if (clubs.length == 0) {
        this.response.speak(NO_CLUBS_MESSAGE);
        this.emit(':responseReady');
        return;
      }

      var club = clubs[0];
      var response = responseForClub(club);
      this.response.speak(response);
      this.emit(':responseReady');
    });
  },
  'AMAZON.HelpIntent': function() {
    const speechOutput = HELP_MESSAGE;
    const reprompt = HELP_REPROMPT;

    this.response.speak(speechOutput).listen(reprompt);
    this.emit(':responseReady');
  },
  'AMAZON.CancelIntent': function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
  'AMAZON.StopIntent': function() {
    this.response.speak(STOP_MESSAGE);
    this.emit(':responseReady');
  },
};

// callback(error, clubs)
// defaults to today
var getClubsForDay = function(theDay, callback) {
  var day = (theDay == null) ? moment().format('dddd').toLowerCase() : theDay.toLowerCase();

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

var responseForClub = function(club) {
  const time = moment(club.time, 'HH:mm').format('hh:mm a');
  return `There is a ${club.name} club at ${time}. It is located at ${club.location}`;
}
