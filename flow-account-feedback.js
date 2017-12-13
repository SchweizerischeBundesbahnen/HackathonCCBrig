var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, results, next) {
        session.dialogData.medium = {};
        builder.Prompts.confirm(session, i18n.__('Are you very satisfied with the result?'));
    },

    function (session, results) {
        if (results.response) {
            session.send("Great!")
        }
        else {
            session.send("I'm very sorry that I wasn't able to answer your question. I am still learning, and will use the record of our interaction to improve my skills in the future.")
            session.send("Please call our Rail Service at <a href='tel:+41900300300'>0900 300 300</a>.")
        }
    },
];


module.exports = dialogs;