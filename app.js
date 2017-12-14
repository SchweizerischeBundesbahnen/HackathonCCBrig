/*
-----------------------------------------------------------------------------
The best bot ever serving for SBB CC-Brig
-----------------------------------------------------------------------------
*/

var restify = require('restify');
var builder = require('botbuilder');
var cognitiveServices = require('botbuilder-cognitiveservices');
var utils = require('./utils');

// Localisation
var i18n = require('./localisation');


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

// Listen for messages from users (connect the server to the connector)
server.post('/api/messages', connector.listen());



// Receive messages from the user and respond by echoing each message back (prefixed with 'You said:')
var bot = new builder.UniversalBot(connector, function (session) {
    session.endDialog(i18n.__('no-matches'));
});


// Storage of the sessions
var inMemoryStorage = new builder.MemoryBotStorage();
bot.set('storage', inMemoryStorage);


// LUIS configuration
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westeurope.api.cognitive.microsoft.com';
var luisRecogniser = new builder.LuisRecognizer('https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey);



//QnA Maker
var qnaRecognizer = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId: process.env.QnAKnowledgeBaseId,
    subscriptionKey: process.env.QnASubscriptionKey,
    top: 4
});


// Install a custom recognizer to look for user saying 'help' or 'goodbye'.
bot.recognizer({
    recognize: function (context, callback) {

        if(context.dialogData) {

            callback(null, null);

        } else {

            //First attempt: LUIS
            luisRecogniser.recognize(context, function (error, result) {

                //LUIS answered
                if (!error && result && result.score >= 0.65) {
                    callback(null, result); //We send back the intent to the flow
                } else {
                    //The threshold is not met, second attempt: QnA
                    qnaRecognizer.recognize(context, function (error, result) {
                        if (!error && result && result.score >= 0.50 && result.answers && result.answers.length > 0) {
                            callback(null, result); //This will end up in the QnA Dialog as an answer
                        } else {
                            callback(error, null);
                        }
                    });
                }
            });
        }
    }
});

//Zahlungsmittel Hinterlegen
var zahlungsMittelDialogs = require('./flow-account-zahlungsmittel');
bot.dialog('ZahlungsMittelHinterlegenDialog', zahlungsMittelDialogs)
    .triggerAction({
        matches: 'Account.Zahlungsmittel-hinterlegen'
    })
    .cancelAction('cancelCreateNote', i18n.__("cancelled"), {
        matches: /^(fertig|stop|cancel)/i,
        confirmPrompt: i18n.__("are-you-sure")
    });


//Spesequittung
var speseQuittungDialogs = require('./flow-account-spesequittung');
bot.dialog('SpesenQuittungDialog', speseQuittungDialogs)
    .triggerAction({
        matches: 'Account.Spesenquittung'
    })
    .cancelAction('cancelCreateNote', i18n.__("cancelled"), {
        matches: /^(fertig|stop|cancel)/i,
        confirmPrompt: i18n.__("are-you-sure")
    });


//Account gesperrt
var accountGesperrtDialogs = require('./flow-account-gesperrt');
bot.dialog('KontoGesperrtDialog', accountGesperrtDialogs)
    .triggerAction({
        matches: 'Account.Gesperrt'
    })
    .cancelAction('cancelCreateNote', i18n.__("cancelled"), {
        matches: /^(fertig|stop|cancel)/i,
        confirmPrompt: i18n.__("are-you-sure")
    });

//Hello
var greetingsHelloDialogs = require('./flow-greetings-hello');
bot.dialog('HelloDialog', greetingsHelloDialogs)
    .triggerAction({
        matches: 'Greetings.Hello'
    });

//Bye
var greetingsByeDialogs = require('./flow-greetings-bye');
bot.dialog('ByeDialog', greetingsByeDialogs)
    .triggerAction({
        matches: 'Greetings.Bye'
    });


//Leave feedback
var feedbackDialogs = require('./flow-account-feedback');
bot.dialog('FeedbackDialog', feedbackDialogs);


//I didn't get that, redirect to QnA Maker
bot.dialog('QnAMakerDialog', function (session, args) {
    session.send(args.intent.answers[0].answer);
    session.endDialog();
    utils.triggerFeedbackDialog(session);
}).triggerAction({
    matches: 'qna'
});


let securityModule = require('./flow-prompt-security');
bot.dialog('AuthMethodPrompt', securityModule.authMethodDialogs);
bot.dialog('SwissPassCardNumberPrompt', securityModule.swissPassDialogs);
bot.dialog('VideoIdentPrompt', securityModule.videoIdentDialogs);
bot.dialog('AlternativeIdentPrompt', securityModule.alternativeIdentDialogs);




// //SmallTalk
// var greetingsSmallTalkDialogs = require('./flow-greetings-smalltalk');
// bot.dialog('SmallTalkDialog', greetingsSmallTalkDialogs)
// .triggerAction({
//     matches: 'Greetings.SmallTalk'
// });

