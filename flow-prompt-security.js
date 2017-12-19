var builder = require('botbuilder');
var i18n = require('./localisation');
var utils = require('./utils');
var customers = require('./data').customers;
var azure = require('azure-storage');
var dateFormat = require('dateformat');

var detectUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false';
var verifyUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/verify';
var cognitiveVisionKey = process.env.CognitiveVisionKey;

var request = require('request').defaults({encoding: null});


swissPassDialogs = [

    function (session, args) {

        if (!session.conversationData.securityContext) {
            //This is the first conversation (new session)
            session.conversationData.securityContext = {
                swissPassCardNumber: null,
                emailAddress: null,
                authenticated: false
            }
        }

        var securityContext = session.conversationData.securityContext;

        if (securityContext.authenticated) {
            //The user is already authenticated
            session.endDialog();
        } else {
            //The user is not authenticated, we start the authentication procedure
            if (args && args.reprompt) {
                var url = 'https://sbbstorage.blob.core.windows.net/cc-brig-bot/swisspassCardWithNumber.png';
                utils.sendAttachmentUrl(session, url, i18n.__("swisspass-id-explanation"), 'image/png', 'SwissPass.png');
                builder.Prompts.text(session, i18n.__("swisspass-id"));
            } else {
                builder.Prompts.text(session, i18n.__("swisspass-id"));
            }
        }
    },

    function (session, results, next) {
        var securityContext = session.conversationData.securityContext;

        var matched = results.response.match(/\d{3}-\d{3}-\d{3}-\d{1}/g);
        var number = matched ? matched.join('') : '';

        if (number) {
            if (customers[number] != null) {
                securityContext.swissPassCardNumber = number;
                securityContext.emailAddress = customers[number].email;
                session.replaceDialog('AuthMethodPrompt');
            } else {
                session.endConversation(i18n.__("auth-error"));
            }
        } else {
            // Repeat the dialog
            session.replaceDialog('SwissPassCardNumberPrompt', {reprompt: true});
        }
    },

];



authMethodDialogs = [

    function (session, args, next) {

        builder.Prompts.choice(session, i18n.__('authentication-method'), [i18n.__('video-ident'), i18n.__('additional-questions')], { listStyle: builder.ListStyle.button });

    },


    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        if(args.response) {

            if(args.response.entity === i18n.__('video-ident')) {
                session.replaceDialog('VideoIdentPrompt');
            } else {
                session.replaceDialog('AlternativeIdentPrompt');
            }

        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },

];




videoIdentDialogs = [

    function (session, args, next) {

        //Prompt for a selfie
        builder.Prompts.attachment(session, i18n.__("take-a-selfie"));

    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        faceRecognition(session, securityContext.swissPassCardNumber, function (faceFound, isIdentical) {
            if (!faceFound) {
                session.endConversation(i18n.__("no-face-found"));
            } else if (isIdentical) {
                let customer = customers[securityContext.swissPassCardNumber];
                securityContext.authenticated = true;
                session.send(i18n.__('successfully-authenticated', {name: customer.firstName + ' ' + customer.lastName}));
                session.endDialog();
            } else {
                session.endConversation(i18n.__("auth-error"));
            }
        })

    }
];



alternativeIdentDialogs = [



    function (session, args, next) {

        if (!session.conversationData.authData) {
            session.conversationData.authData = {
                firstName: null,
                lastName: null,
                birthday: null
            }
        }

        builder.Prompts.text(session, i18n.__("first-name"));
    },


    function (session, args, next) {

        var authData = session.conversationData.authData;

        if(args.response) {
            authData.firstName = args.response;
            next();
        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },


    function (session, args, next) {

        builder.Prompts.text(session, i18n.__("last-name"));

    },

    function (session, args, next) {

        var authData = session.conversationData.authData;

        if(args.response) {
            authData.lastName = args.response;
            next();
        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },


    function (session, args) {

        builder.Prompts.text(session, i18n.__("birthday"));

    },

    function (session, args, next) {

        var authData = session.conversationData.authData;

        var date_regex = /^\d{2}\.\d{2}\.\d{4}$/;

        if (date_regex.test(args.response)) {
            var from = args.response.split(".");
            authData.birthday = new Date(from[2], from[1] - 1, from[0]);
            next();
        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;
        var authData = session.conversationData.authData;

        if(authData.firstName && authData.lastName && authData.birthday) {

            var birthday = dateFormat(authData.birthday, "yyyy-mm-dd");
            let customer = customers[securityContext.swissPassCardNumber];

            if(customer.firstName.toLowerCase() === authData.firstName.toLowerCase() && customer.lastName.toLowerCase() === authData.lastName.toLowerCase() && customer.birthday === birthday) {
                securityContext.authenticated = true;
                session.send(i18n.__('successfully-authenticated', {name: customer.firstName + ' ' + customer.lastName}));
                session.endDialog();
            } else {
                session.endConversation(i18n.__("auth-error"));
            }

        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    },

];



module.exports.swissPassDialogs = swissPassDialogs;
module.exports.authMethodDialogs = authMethodDialogs;
module.exports.videoIdentDialogs = videoIdentDialogs;
module.exports.alternativeIdentDialogs = alternativeIdentDialogs;







function faceDetectionOnBlob(blobSvc, container, blob, callback) {

    // Generate a Storage Access Signature (SAS) to create a temporary URL allowing the 
    // cognitive service to access the image on Blob storage.

    var startDate = new Date();
    var expiryDate = new Date(startDate);
    expiryDate.setMinutes(startDate.getMinutes() + 100);
    startDate.setMinutes(startDate.getMinutes() - 100);

    var sharedAccessPolicy = {
        AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
            Start: startDate,
            Expiry: expiryDate
        },
    };

    var blob_sas = blobSvc.generateSharedAccessSignature(container, blob, sharedAccessPolicy);
    var blob_sas_url = blobSvc.host.primaryHost + container + '/' + blob + '?' + blob_sas;

    // Call face detection

    faceDetectionOnUrl(blob_sas_url, callback);
}

function faceDetectionOnUrl(blob_sas_url, callback) {

    var requestData = {
        url: detectUrl,
        method: 'POST',
        headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': cognitiveVisionKey},
        json: {'url': blob_sas_url}
    };

    request(requestData, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            if (body && body[0]) {
                callback(true, body[0].faceId)
            } else {
                callback(false)
            }
        } else {
            console.log("failure");
            console.log(response);
            console.log(error);
        }
    });
}


function faceVerification(faceId1, faceId2, callback) {
    var requestData = {
        url: verifyUrl,
        method: 'POST',
        headers: {'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': cognitiveVisionKey},
        json: {'faceId1': faceId1, 'faceId2': faceId2}
    };

    request(requestData, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            if (body) {
                callback(body.isIdentical)
            } else {
                console.log("error");
            }
        } else {
            console.log("failure");
            console.log(response);
            console.log(error);
        }

    });
}


function faceRecognition(session, swissPassCardNumber, callback) {

    var imgUrl = session.message.attachments[0].contentUrl;

    var azure = require('azure-storage');
    var retryOperations = new azure.ExponentialRetryPolicyFilter();
    var blobSvc = azure.createBlobService().withFilter(retryOperations);

    var uploadContainer = "uploads";
    var swissPassImgContainer = "sbbdb";

    var http = require('http');

    const uuidv4 = require('uuid/v4');
    var uploadBlob = uuidv4(); // random name

    var requestData = {
        url: imgUrl
    };
    request(imgUrl, function (error, response, body) {
        blobSvc.createBlockBlobFromText(uploadContainer, uploadBlob, body, function (error, result, response) {

            faceDetectionOnBlob(blobSvc, uploadContainer, uploadBlob, function (faceFound1, faceId1) {
                if (!faceFound1) {
                    callback(false);
                    return
                }

                faceDetectionOnBlob(blobSvc, swissPassImgContainer, swissPassCardNumber + ".jpg", function (faceFound2, faceId2) {
                    faceVerification(faceId1, faceId2, function (isIdentical) {
                        callback(true, isIdentical)
                    })
                })
            });
            return true;
        });
    });
}
