var builder = require('botbuilder');
var i18n = require('./localisation').security;
var utils = require('./utils');


dialogs = [

    function (session, args) {

        if (!session.conversationData.securityContext) {
            //This is the first conversation (new session)
            session.conversationData.securityContext = {
                swissPassCardNumber: null,
                authenticated: false
            }
        }

        if (session.conversationData.securityContext.authenticated) {
            //The user is already authenticated
            session.endDialogWithResult({
                response: session.conversationData.securityContext.swissPassCardNumber
            });
        } else {
            //The user is not authenticated, we start the authentication procedure
            if (args && args.reprompt) {
                var url = 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/swisspassCardWithNumber.png';
                utils.sendAttachmentUrl(session, url, i18n.__("swisspass-id-explanation"), 'image/png', 'SwissPass.png');
                builder.Prompts.text(session, i18n.__("swisspass-id"));
            } else {
                builder.Prompts.text(session, i18n.__("swisspass-id"));
            }
        }
    },

    function (session, results) {
        var matched = results.response.match(/\d{3}-\d{3}-\d{3}-\d{1}/g);
        var number = matched ? matched.join('') : '';
        if (number) {
            session.conversationData.securityContext.swissPassCardNumber = number;
            session.conversationData.securityContext.authenticated = true;
            session.endDialogWithResult({response: number});
        } else {
            // Repeat the dialog
            session.replaceDialog('SwissPassCardNumberPrompt', {reprompt: true});
        }
    }

];


module.exports = dialogs;