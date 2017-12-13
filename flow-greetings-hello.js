var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, args) {
        session.endDialog(i18n.__('Hello :-)'));
    },

];


module.exports = dialogs;