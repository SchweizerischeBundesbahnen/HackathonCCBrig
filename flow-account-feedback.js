var builder = require('botbuilder');
var i18n = require('./localisation').gesperrt;

dialogs = [

    function (session, args) {
        session.endDialog();
    },

];


module.exports = dialogs;