var builder = require('botbuilder');
var i18n = require('./localisation');

dialogs = [

    function (session, args) {
        session.endConversation(i18n.__("bye-bye"));
    },

];


module.exports = dialogs;