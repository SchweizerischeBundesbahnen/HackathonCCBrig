/*
-----------------------------------------------------------------------------
The best bot ever serving for SBB CC-Brig
-----------------------------------------------------------------------------
*/

var restify = require('restify');
var builder = require('botbuilder');

var cognitiveservices = require('botbuilder-cognitiveservices');

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


//Storage
var inMemoryStorage = new builder.MemoryBotStorage();


// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector);
bot.set('storage', inMemoryStorage);


// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';

var qnaKnowledgeBaseId = process.env.QnAKnowledgeBaseId;
var qnaSubscriptionKey = process.env.QnASubscriptionKey;

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var LuisRecogniser = new builder.LuisRecognizer(LuisModelUrl);

var qnarecognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: qnaKnowledgeBaseId,
    subscriptionKey: qnaSubscriptionKey,
    top: 4});

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers: [qnarecognizer],
    defaultMessage: 'No match! Try changing the query terms!',
    qnaThreshold: 0.3
});


bot.recognizer(LuisRecogniser);


//Zahlungsmittel Hinterlegen
var zahlungsMittelDialogs = require('./flow-account-zahlungsmittel');
bot.dialog('ZahlungsMittelHinterlegenDialog', zahlungsMittelDialogs).triggerAction({
    matches: 'Account.Zahlungsmittel-hinterlegen'
});


//Spesequittung
var speseQuittungDialogs = require('./flow-account-spesequittung');
bot.dialog('SpesenQuittungDialog', speseQuittungDialogs).triggerAction({
    matches: 'Account.Spesenquittung'
});


//Account gesperrt
var accountGesperrtDialogs = require('./flow-account-gesperrt');
bot.dialog('KontoGesperrtDialog', accountGesperrtDialogs).triggerAction({
    matches: 'Account.Gesperrt'
});


//Hello
var greetingsHelloDialogs = require('./flow-greetings-hello');
bot.dialog('HelloDialog', greetingsHelloDialogs).triggerAction({
    matches: 'Greetings.Hello'
});

//Bye
var greetingsByeDialogs = require('./flow-greetings-bye');
bot.dialog('ByeDialog', greetingsByeDialogs).triggerAction({
    matches: 'Greetings.Bye'
});


//SmallTalk
var greetingsSmallTalkDialogs = require('./flow-greetings-smalltalk');
bot.dialog('SmallTalkDialog', greetingsSmallTalkDialogs).triggerAction({
    matches: 'Greetings.SmallTalk'
});


//Help
var helpDialogs = require('./flow-help');
bot.dialog('HelpDialog', helpDialogs).triggerAction({
    matches: 'Help'
});


//I didn't get that
bot.dialog('NoneDialog', function (session, args) {
    bot.dialog('/', basicQnAMakerDialog);
}).triggerAction({
    matches: 'None'
});




var swissPassCardNumberDialogs = require('./flow-prompt-swisspass');
bot.dialog('SwissPassCardNumberPrompt', swissPassCardNumberDialogs);