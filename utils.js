var builder = require('botbuilder');

// Sends attachment using an Internet url
function sendInternetUrl(session, url, text, contentType, attachmentFileName) {
    var msg = new builder.Message(session)
        .text(text)
        .addAttachment({
            contentUrl: url,
            contentType: contentType,
            name: attachmentFileName
        });

    session.send(msg);
}

function triggerFeedbackDialog(session) {
    setTimeout(function() {
        session.beginDialog('FeedbackDialog')
    }, 3000);
}


module.exports.sendAttachmentUrl = sendInternetUrl;
module.exports.triggerFeedbackDialog = triggerFeedbackDialog;
