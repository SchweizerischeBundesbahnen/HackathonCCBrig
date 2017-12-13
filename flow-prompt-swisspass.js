var builder = require('botbuilder');
var i18n = require('./localisation').security;
var utils = require('./utils');


dialogs = [

    function (session, args) {

        if (args && args.reprompt) {
            var url = 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/swisspassCardWithNumber.png';
            utils.sendAttachmentUrl(session, url, i18n.__("swisspass-id-explanation"), 'image/png', 'SwissPass.png');
            builder.Prompts.text(session, i18n.__("swisspass-id"));
        } else {
            builder.Prompts.text(session, i18n.__("swisspass-id"));
        }
    },

    function (session, results) {
        var matched = results.response.match(/\d{3}-\d{3}-\d{3}-\d{1}/g);
        var number = matched ? matched.join('') : '';
        if (number) {
            session.endDialogWithResult({response: number});
        } else {
            // Repeat the dialog
            session.replaceDialog('SwissPassCardNumberPrompt', {reprompt: true});
        }
    }

];


module.exports = dialogs;