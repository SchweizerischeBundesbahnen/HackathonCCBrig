var builder = require('botbuilder');
var i18n = require('./localisation');
var dateFormat = require('dateformat');
var utils = require('./utils');
var receipts = require('./data').receipts;

dialogs = [

    function (session) {
        session.beginDialog("SwissPassCardNumberPrompt");
    },

    function (session, args, next) {

        //Initialise the data
        if(!session.conversationData.travelInfo) {
            session.conversationData.travelInfo = {
                travelDate: null,
                travelFrom: null,
                travelTo:   null
            }
        }

        next();
    },


    function (session, args) {

        builder.Prompts.text(session, i18n.__("travel-date"));

    },

    function (session, args, next) {

        var travelInfo = session.conversationData.travelInfo;
        var date_regex = /^\d{2}\.\d{2}\.\d{4}$/;

        if (date_regex.test(args.response)) {
            var from = args.response.split(".");
            travelInfo.travelDate = new Date(from[2], from[1] - 1, from[0]);
            next();
        } else {
            session.endDialog(i18n.__("invalid-input"));
        }

    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;
        var travelInfo = session.conversationData.travelInfo;

        session.send(i18n.__("searching-receipts", {date: dateFormat(travelInfo.travelDate, "dddd, mmmm dS, yyyy"), card: securityContext.swissPassCardNumber}));

        next();
    },


    function (session, args, next) {

        var cards = getQuittungenCarousel(session);

        if(cards.length > 0) {
            // create reply with Carousel AttachmentLayout
            session.send(new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel).attachments(cards));
            session.endDialog();
            utils.triggerFeedbackDialog(session);
        } else {
            session.send(i18n.__("no-results"));
            session.replaceDialog('SpesenQuittungDialog')
        }
    }

];


function getQuittungenCarousel(session) {

    var securityContext = session.conversationData.securityContext;
    var travelInfo = session.conversationData.travelInfo;
    var date = dateFormat(new Date(travelInfo.travelDate), "yyyy-mm-dd");

    var cards = [];

    if(receipts[securityContext.swissPassCardNumber] && receipts[securityContext.swissPassCardNumber][date]) {
        var myReceipts = receipts[securityContext.swissPassCardNumber][date];

        for (var i = 0; i < myReceipts.length; i++) {
            cards.push(
                new builder.HeroCard(session)
                    .title(i18n.__("receipt-title", { id: i+1 }))
                    .text(i18n.__("receipt-text", { text: myReceipts[i] }))
                    .images([
                        builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Quittung-Thumbnail.png')
                    ])
                    .buttons([
                        builder.CardAction.openUrl(session, '#', i18n.__("download"))
                    ])
            );
        }
    }

    return cards;
}


module.exports.normalFlow = dialogs;
