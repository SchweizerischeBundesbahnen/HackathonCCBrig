
dialogs = [

    function (session, args) {
        session.endDialog('Sorry, I did not understand \'%s\'. Type \'help\' if you need assistance.', session.message.text);
    },



];

module.exports = dialogs;