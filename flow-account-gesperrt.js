var builder = require('botbuilder');
var i18n = require('./localisation');
var utils = require('./utils');

dialogs = [

    function (session, args) {
        session.beginDialog("SwissPassCardNumberPrompt");
    },

    function (session, args, next) {
        builder.Prompts.text(session, i18n.__("email-address"));
    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        if (args.response && args.response === securityContext.emailAddress) {
            next();
        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },

    function (session, args) {
        var securityContext = session.conversationData.securityContext;
        session.send(i18n.__("account-reactivated", {email: securityContext.emailAddress}));
        utils.triggerFeedbackDialog(session);
        session.endDialog();
    },

];


module.exports = dialogs;