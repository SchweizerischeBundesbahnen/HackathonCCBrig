/*-----------------------------------------------------------------------------
A simple echo bot for the Microsoft Bot Framework.
-----------------------------------------------------------------------------*/

var restify = require('restify');
var builder = require('botbuilder');

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
var connector = new builder.ChatConnector({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword,
    stateEndpoint: process.env.BotStateEndpoint,
    openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

/*----------------------------------------------------------------------------------------
* Bot Storage: This is a great spot to register the private state storage for your bot. 
* We provide adapters for Azure Table, CosmosDb, SQL Azure, or you can implement your own!
* For samples and documentation, see: https://github.com/Microsoft/BotBuilder-Azure
* ---------------------------------------------------------------------------------------- */

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

bot.dialog('ZahlungsMittelHinterlegenDialog', function (session, args) {
    session.endDialog('Account.Zahlungsmittel-hinterlegen');
}).triggerAction({
    matches: 'Account.Zahlungsmittel-hinterlegen'
});

bot.dialog('SpesenQuittungDialog', function (session, args) {
    session.endDialog('Account.Spesenquittung');
}).triggerAction({
    matches: 'Account.Spesenquittung'
});

bot.dialog('KontoGesperrtDialog', function (session, args) {
    session.endDialog('Account.Gesperrt');
}).triggerAction({
    matches: 'Account.Gesperrt'
});


bot.dialog('HelloDialog', function (session) {
    session.endDialog('Hello to you too!');
}).triggerAction({
    matches: 'Greetings.Hello'
});


bot.dialog('ByeDialog', function (session) {
    session.endDialog('Byeeee!');
}).triggerAction({
    matches: 'Greetings.Bye'
});


bot.dialog('SmallTalkDialog', function (session) {
    session.endDialog('I\'m super good, as always! Thanks for asking...');
}).triggerAction({
    matches: 'Greetings.SmallTalk'
});



bot.dialog('HelpDialog', function (session) {
    session.endDialog('This is the help dialog');
}).triggerAction({
    matches: 'Help'
});


bot.dialog('NoneDialog', function (session) {
    session.endDialog('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
}).triggerAction({
    matches: 'None'
});
