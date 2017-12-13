var builder = require('botbuilder');
var i18n = require('./localisation');
var dateFormat = require('dateformat');

var receipts = require('./data').receipts;

dialogs = [

    function (session) {
        session.beginDialog("SwissPassCardNumberPrompt");
    },

    function (session, args) {
        //Travel time
        builder.Prompts.time(session, i18n.__("travel-date"));
    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        if(!session.dialogData.travelInfo) {
            session.dialogData.travelInfo = {
                travelDate: null,
                travelFrom: null,
                travelTo:   null
            }
        }


        var travelInfo = session.dialogData.travelInfo;

        if(args.response) {
            travelInfo.travelDate = builder.EntityRecognizer.resolveTime([args.response]);
        }

        var date = new Date(travelInfo.travelDate);
        session.send(i18n.__("searching-receipts", {date: dateFormat(date, "dddd, mmmm dS, yyyy"), card: securityContext.swissPassCardNumber}));

        next();
    },


    function (session, args, next) {

        var cards = getQuittungenCarousel(session);

        if(cards.length > 0) {
            // create reply with Carousel AttachmentLayout
            session.send(new builder.Message(session).attachmentLayout(builder.AttachmentLayout.carousel).attachments(cards));
            session.endDialog();
        } else {
            session.send('No quittung found, please select a different travel date');
            session.replaceDialog('SpesenQuittungDialog')
        }
    }

];


function getQuittungenCarousel(session) {

    var securityContext = session.conversationData.securityContext;
    var travelInfo = session.dialogData.travelInfo;
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


module.exports = dialogs;