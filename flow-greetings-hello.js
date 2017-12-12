
var i18n = require('./localisation').hello;

dialogs = [

    function (session, args) {
        session.endDialog(i18n.__('Hello :-)'));
    },

];


module.exports = dialogs;