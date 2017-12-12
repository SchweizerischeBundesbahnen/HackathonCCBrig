var builder = require('botbuilder');
var i18n = require('./localisation').spesenquittung;


dialogs = [

    function (session, args, next) {

        var intent = args.intent;

        var swissPassCardNumber = builder.EntityRecognizer.findEntity(intent.entities, 'SwissPassNumberEntity');

        var params = session.dialogData.params = {
            swissPassCardNumber: swissPassCardNumber ? swissPassCardNumber.entity.toString() : null,
            travelDate         : null,
            travelFrom         : null,
            travelTo           : null
        };

        // Prompt for SwissPass Card Number
        if (!params.swissPassCardNumber) {
            builder.Prompts.text(session, i18n.__("swisspass-id"));
            var url = 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/swisspassCardWithNumber.png';
            sendInternetUrl(session, url, i18n.__("swisspass-id-explanation"), 'image/png', 'SwissPass.png');
        } else {
            next();
        }

    },

    function (session, args, next) {

        var params = session.dialogData.params;

        if(args.response) {
            //var swissCardNumber = builder.EntityRecognizer.findEntity(args.intent.entities, 'SwissPassNumberEntity');
            params.swissPassCardNumber = args.response;
        }

        session.send(`Your input ${params.swissPassCardNumber}`);

        builder.Prompts.time(session, i18n.__("travel-date"));

    },

    function (session, args, next) {

        var params = session.dialogData.params;

        if(args.response) {
            params.travelDate = builder.EntityRecognizer.resolveTime([args.response]);
        }

        session.send(`Your input ${params.travelDate}`);

        next();

    },


    function (session, args, next) {

        var cards = getQuittungenCarousel();

        // create reply with Carousel AttachmentLayout
        var reply = new builder.Message(session)
            .attachmentLayout(builder.AttachmentLayout.carousel)
            .attachments(cards);

        session.send(reply);

        session.endDialog();
    }

];



// Sends attachment using an Internet url
function sendInternetUrl(session, url, text, contentType, attachmentFileName) {
    var msg = new builder.Message(session)
        .text(text)
        .addAttachment({
            contentUrl: url,
            contentType: contentType,
            name: attachmentFileName
        });

    session.send(msg);
}



function getQuittungenCarousel(session) {
    return [
        new builder.ThumbnailCard(session)
            .title('BotFramework Thumbnail Card')
            .subtitle('Your bots — wherever your users are talking')
            .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
            .images([
                builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
            ]),
        new builder.ThumbnailCard(session)
            .title('BotFramework Thumbnail Card')
            .subtitle('Your bots — wherever your users are talking')
            .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
            .images([
                builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
            ]),
        new builder.ThumbnailCard(session)
            .title('BotFramework Thumbnail Card')
            .subtitle('Your bots — wherever your users are talking')
            .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
            .images([
                builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
            ]),
        new builder.ThumbnailCard(session)
            .title('BotFramework Thumbnail Card')
            .subtitle('Your bots — wherever your users are talking')
            .text('Build and connect intelligent bots to interact with your users naturally wherever they are, from text/sms to Skype, Slack, Office 365 mail and other popular services.')
            .images([
                builder.CardImage.create(session, 'https://sec.ch9.ms/ch9/7ff5/e07cfef0-aa3b-40bb-9baa-7c9ef8ff7ff5/buildreactionbotframework_960.jpg')
            ])
            .buttons([
                builder.CardAction.openUrl(session, 'https://docs.microsoft.com/bot-framework/', 'Get Started')
            ])
    ];
}


module.exports = dialogs;