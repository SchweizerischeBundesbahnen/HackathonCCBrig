var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, results, next) {
        session.dialogData.medium = {};
        builder.Prompts.choice(session, i18n.__('feedback-question'), [i18n.__('yes'), i18n.__('no')], {listStyle: builder.ListStyle.button});
    },

    function (session, results, next) {

        if (results.response) {
            session.dialogData.medium = results.response.entity;
        }

        next();
    },

    function (session, args, next) {

        if (session.dialogData.medium) {

            if(session.dialogData.medium === i18n.__('yes')) {
                session.send(i18n.__('thank-you'));
                session.send(i18n.__('can-i-help-you-more'));
            } else {
                session.send(i18n.__('text-no-1'));
                session.send(i18n.__('text-no-2'));
            }
            session.endDialog();
        } else {
            session.endDialogWithResult({
                resumed: builder.ResumeReason.notCompleted
            });
        }
    },

];


module.exports = dialogs;