var builder = require('botbuilder');
var i18n = require('./localisation').spesenquittung;
var dateFormat = require('dateformat');


dialogs = [

    function (session) {

        var params = session.dialogData.params = {
            swissCardNumber: null
        };

        session.beginDialog("SwissPassCardNumberPrompt");
    },

    function (session, args) {
        var params = session.dialogData.params;

        if(args.response) {
            params.swissCardNumber = args.response;
            session.send(`Your SwissCard ${params.swissCardNumber}`);
        }

        builder.Prompts.time(session, i18n.__("travel-date"));

    },

    function (session, args, next) {

        var params = session.dialogData.params;

        if(args.response) {
            params.travelDate = builder.EntityRecognizer.resolveTime([args.response]);
        }

        var date = new Date(params.travelDate);

        session.send(`Your input ${params.swissCardNumber}, ${dateFormat(date, "dddd, mmmm dS, yyyy")}`);

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


function getQuittungenCarousel(session) {

    var cards = [];

    for (i = 0; i < 5; i++) {
        cards.push(
            new builder.HeroCard(session)
                .title(i18n.__("quittung-title", { id: i+1 }))
                .text(i18n.__("quittung-text", { text: `abc-123-${i}` }))
                .images([
                    builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Quittung-Thumbnail.png')
                ])
                .buttons([
                    builder.CardAction.openUrl(session, '#', i18n.__("download"))
                ])
        );
    }

    return cards;
}


module.exports = dialogs;