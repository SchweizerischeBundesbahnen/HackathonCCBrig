var builder = require('botbuilder');
var i18n = require('./localisation').security;
var utils = require('./utils');

dialogs = [

    function (session, args) {

        if (args && args.reprompt) {
            var url = 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/swisspassCardWithNumber.png';
            utils.sendAttachmentUrl(session, url, i18n.__("swisspass-id-explanation"), 'image/png', 'SwissPass.png');
            builder.Prompts.text(session, i18n.__("swisspass-id"));
        } else {
            builder.Prompts.text(session, i18n.__("swisspass-id"));
        }
    },

    function (session, results) {
        var matched = results.response.match(/\d{3}-\d{3}-\d{3}-\d{1}/g);
        var number = matched ? matched.join('') : '';
        if (number) {
            session.send(number);
            builder.Prompts.attachment(session, i18n.__("Send me your most beautiful smile :) Please load a photo of you for authentification"));
        } else {
            // Repeat the dialog
            session.replaceDialog('SwissPassCardNumberPrompt', {reprompt: true});
        }
    },

    function (session, results) {
        var imgUrl = session.message.attachments[0].contentUrl;
        session.send("I received your image " + imgUrl);
        var request = require('request').defaults({ encoding: null });
        var detectUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false';
        var key = "aacf0863280c4da4be31aff303c2cbed";

        //First detect faces on images
        var requestData = {
            url: detectUrl,
            encoding: 'binary',
            method : 'POST',
            headers: { 'content-type': 'application/octet-stream', 'Ocp-Apim-Subscription-Key': key },
            form: {'url': imgUrl }
        };
        request(requestData, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                console.log(body);
                session.send("toto");
            } else {
                console.log(response);
                console.log(error);
            }

        });

        //Then verify if images are similar
        //var verifyUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0';*/
    } 

]; 


module.exports = dialogs;