var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, results, next) {
        session.dialogData.medium = {};
        builder.Prompts.choice(session, i18n.__('Are you very satisfied with the result?'), [i18n.__('Yes'), i18n.__('No')], {listStyle: builder.ListStyle.button});
    },

    function (session, results, next) {

        if (results.response) {
            session.dialogData.medium = results.response.entity;
        }

        next();
    },

    function (session, args, next) {

        if (session.dialogData.medium) {

            if(session.dialogData.medium === 'Yes') {
                session.send("Thank you!")
            } else {
                session.send("I'm very sorry that I wasn't able to answer your question. I am still learning, and will use the record of our interaction to improve my skills in the future.")
                session.send("Please call our Rail Service at [0900 300 300](tel:+41900300300).")
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