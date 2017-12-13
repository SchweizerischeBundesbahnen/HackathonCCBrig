var builder = require('botbuilder');
var i18n = require('./localisation');
var utils = require('./utils');
var customers = require('./data').customers;
var azure = require('azure-storage');

var detectUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/detect?returnFaceId=true&returnFaceLandmarks=false';
var verifyUrl = 'https://westeurope.api.cognitive.microsoft.com/face/v1.0/verify';
var cognitiveVisionKey = process.env.CognitiveVisionKey;
var request = require('request').defaults({ encoding: null });


dialogs = [

    function (session, args) {

        if (!session.conversationData.securityContext) {
            //This is the first conversation (new session)
            session.conversationData.securityContext = {
                swissPassCardNumber: null,
                emailAddress: null,
                faceImageUrl: null,
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
            if(customers[number] != null) {
                securityContext.swissPassCardNumber = number;
                securityContext.emailAddress = customers[number].email;
                securityContext.faceImageUrl = customers[number].faceImageUrl;
                securityContext.name = customers[number].name;
                next();
            } else {
                session.endConversation(i18n.__("auth-error"));
            }
        } else {
            // Repeat the dialog
            session.replaceDialog('SwissPassCardNumberPrompt', {reprompt: true});
        }
    },


    function (session, args, next) {

        //Prompt for a selfie
        builder.Prompts.attachment(session, i18n.__("take-a-selfie"));

    },

    function (session, args, next) {

        var securityContext = session.conversationData.securityContext;

        var matches = faceRecognition(session, securityContext.faceImageUrl, function(isIdentical) {
            session.send("Result: " + isIdentical);
        }
        );

        if(matches) {
            session.conversationData.securityContext.authenticated = true;
            session.send(i18n.__('successfully-authenticated', {name: securityContext.name}));
            session.endDialog();
        } else {
            session.endConversation(i18n.__("auth-error"));
        }

    }


];


function faceDetection(blobSvc, container, blob, callback) {
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
    
            //First detect faces on images
            var requestData = {
                url: detectUrl,
                method : 'POST',
                headers: { 'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': cognitiveVisionKey },
                json: {'url': blob_sas_url }
            };
    
            request(requestData, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                    console.log("success");
                    console.log(body);
                    console.log("parse");
                    console.log("successful");
                    if (body) {
                        callback(body[0].faceId)
                    } else {
                        console.log("no face found");
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
                method : 'POST',
                headers: { 'content-type': 'application/json', 'Ocp-Apim-Subscription-Key': cognitiveVisionKey },
                json: {'faceId1': faceId1, 'faceId2': faceId1 }
            };
    
            request(requestData, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    // Print out the response body
                    console.log("successverif");
                    console.log(body);
                    if (body) {
                        callback(body.isIdentical)
                    } else {
                        console.log("no face found");
                    } 
                } else {
                    console.log("failure");
                    console.log(response);
                    console.log(error);
                }
    
            });
}
    


function faceRecognition(session, onFileImageUrl, callback) {

    var imgUrl = session.message.attachments[0].contentUrl;
    session.send("I received your image " + imgUrl);


    var azure = require('azure-storage');
    var retryOperations = new azure.ExponentialRetryPolicyFilter();
    var blobSvc = azure.createBlobService().withFilter(retryOperations);

    var uploadContainer = "uploads";

    var http = require('http');

    const uuidv4 = require('uuid/v4');
    var uploadBlob = uuidv4(); // random name

    var requestData = {
        url: imgUrl
    };
    request(imgUrl, function (error, response, body) {
        blobSvc.createBlockBlobFromText(uploadContainer, uploadBlob, body, function(error, result, response) {
        
            faceDetection(blobSvc, uploadContainer, uploadBlob, function(faceId1) {
            	faceDetection(blobSvc, uploadContainer, uploadBlob, function(faceId2) {
            	    faceVerification(faceId1, faceId2, function(result) {
			    callback(result)
		    })
		})
            })
            return true;
        });
    });
}



module.exports = dialogs;
