var builder = require('botbuilder');
var i18n = require('./localisation').gesperrt;

dialogs = [

    function (session, args) {
        session.beginDialog("SwissPassCardNumberPrompt");
    },


    function (session, args) {
        session.endDialog('Account.Gesperrt');
    },

];


module.exports = dialogs;