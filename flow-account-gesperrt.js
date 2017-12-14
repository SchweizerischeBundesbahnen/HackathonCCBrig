var builder = require('botbuilder');
var i18n = require('./localisation');
var utils = require('./utils');

dialogs = [

    function (session, args, next) {
        if(args && !args.reprompt) {
            session.beginDialog("SwissPassCardNumberPrompt");
        } else {
            next({reprompt: args.reprompt});
        }
    },

    function (session, args) {
        if(args && args.reprompt) {
            builder.Prompts.text(session, i18n.__('email-address-retry'));
        } else {
            builder.Prompts.text(session, i18n.__('email-address'));
        }
    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        if (args.response && args.response.toLowerCase() === securityContext.emailAddress) {
            next();
        } else {
            //session.endConversation(i18n.__("auth-error"));
            session.replaceDialog('KontoGesperrtDialog', {reprompt: true});
        }

    },

    function (session, args) {
        var securityContext = session.conversationData.securityContext;
        session.send(i18n.__("account-reactivated", {email: securityContext.emailAddress}));
        session.endDialog();
        utils.triggerFeedbackDialog(session);
    },

];


module.exports = dialogs;