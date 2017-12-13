var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, args) {
        session.endDialog();
    },

];


module.exports = dialogs;