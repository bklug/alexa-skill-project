'use strict';
const Alexa = require('alexa-sdk');
const AWS = require("aws-sdk");
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
const HELP_MESSAGE = 'You can say tell me a school club for a date, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Goodbye!';


exports.handler = function(event, context, callback) {
  console.log("Registering handlers");
  var alexa = Alexa.handler(event, context);
  alexa.appId = APP_ID;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  'LaunchRequest': function() {
    this.response.speak("Ask me about all the clubs we have here at B.C.I.T.").listen("Ask about a club for any day of the week.");
    this.emit(':responseReady');
  },
  'GetClubsForDayIntent': function() {
    const date = this.event.request.intent.slots.day.value;
    console.log("DATE: " + date);
    const day = Moment(date).format('dddd');
    console.log("DAY: " + day);

    var strongThis = this;

    getClubsForDay(day, (error, clubs) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        if (clubs.length == 0) {
          strongThis.response.speak('Sorry, there are were no clubs on that day!');
          strongThis.emit(':responseReady');
          return;
        }

        clubs.sort((a, b) => a.time < b.time);

        var club = clubs[0];
        const time = Moment(club.time, 'HH:mm').format('hh:mm a');
        strongThis.response.speak(`There is a ${club.name} club at ${time}. It is located at ${club.location}`);
        strongThis.emit(':responseReady');
      }
    });
  },
  'GetDateForClubIntent': function() {
    const clubname = this.event.request.intent.slots.clubname.value;
    console.log(`CLUBNAME: ${clubname}`);

    var strongThis = this;

    getClubsByName(clubname.toLowerCase(), (error, clubs) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        if (clubs.length == 0) {
          strongThis.response.speak('Sorry, there are were no clubs with that name!');
          strongThis.emit(':responseReady');
          return;
        }

        var club = clubs[0];
        const time = Moment(club.time, 'HH:mm').format('hh:mm a');
        strongThis.response.speak(`There is a ${club.name} club on ${club.day} at ${time}. It is located at ${club.location}`);
        strongThis.emit(':responseReady');
      }
    });
  },
  'GetDescriptionForClubIntent': function() {
    const clubname = this.event.request.intent.slots.clubname.value;
    console.log(`CLUBNAME: ${clubname}`);

    var strongThis = this;

    getClubsByName(clubname.toLowerCase(), (error, clubs) => {
      if (error) {
        console.log("ERROR: " + error);
      } else {
        if (clubs.length == 0) {
          strongThis.response.speak('Sorry, there are were no clubs with that name!');
          strongThis.emit(':responseReady');
          return;
        }

        var club = clubs[0];
        strongThis.response.speak(club.description);
        strongThis.emit(':responseReady');
      }
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
  var day = (theDay == null) ? Moment().format('dddd').toLowerCase() : theDay.toLowerCase();

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

// callback(error, clubs)
// defaults to today
var getClubsByName = function(name, callback) {

  var params = {
    TableName: tableName,
    FilterExpression: "#name = :name",
    ExpressionAttributeNames: {
      "#name": "name",
    },
    ExpressionAttributeValues: {
      ":name": name
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
