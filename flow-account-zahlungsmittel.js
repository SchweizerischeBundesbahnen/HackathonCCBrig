var builder = require('botbuilder');
var i18n = require('./localisation');
var utils = require('./utils');

dialogs = [

    function (session, results, next) {
        session.dialogData.medium = {};
        builder.Prompts.choice(session, i18n.__('medium-selection'), [i18n.__('desktop'), i18n.__('sbb-app')], {listStyle: builder.ListStyle.button});
    },

    function (session, results, next) {

        if (results.response) {
            session.dialogData.medium = results.response.entity;
        }

        next();
    },

    function (session, args, next) {

        if (session.dialogData.medium) {

            var cards = null;
            if(session.dialogData.medium === i18n.__('desktop')) {
                cards = getCardsWebDesktop(session);
            } else {
                session.send(i18n.__('zahlungsmittel-video.mobile.intro'));
                cards = getCardsMobileApp(session);
            }

            // create reply with Carousel AttachmentLayout
            var reply = new builder.Message(session)
                .attachmentLayout(builder.AttachmentLayout.carousel)
                .attachments(cards);

            session.send(reply);

            utils.triggerFeedbackDialog(session);

            session.endDialog();
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    },

];


function getCardsWebDesktop(session) {
    return [
        new builder.SigninCard(session)
            .text(i18n.__('zahlungsmittel-login.desktop.text'))
            .button('Sign-in', 'https://www.sbb.ch/de/login/loginswisspass.html?lang=de&backUrl=/de/home.html'),

        new builder.HeroCard(session)
            .title(i18n.__('zahlungsmittel-youraccount.desktop.title'))
            .text(i18n.__('zahlungsmittel-youraccount.desktop.text'))
            .images([
                builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Zahlungsmittel-1.png'),
                builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Zahlungsmittel-2.png')
            ]),

        new builder.HeroCard(session)
            .title(i18n.__('zahlungsmittel-zahlung.desktop.title'))
            .text(i18n.__('zahlungsmittel-zahlung.desktop.text'))
            .images([
                builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Zahlungsmittel-3.png')
            ]),

        new builder.HeroCard(session)
            .title(i18n.__('zahlungsmittel-hinlegen.desktop.title'))
            .text(i18n.__('zahlungsmittel-hinlegen.desktop.text'))
            .images([
                builder.CardImage.create(session, 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/Zahlungsmittel-4.png')
            ]),

    ];
}


function getCardsMobileApp(session) {
    return [
        new builder.VideoCard(session)
            .title(i18n.__('zahlungsmittel-video.mobile.title'))
            .text(i18n.__('zahlungsmittel-video.mobile.text'))
            .media([
                { url: 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/sbb-kreditkarte-iphone.mp4' }
            ])
    ];
}

module.exports = dialogs;