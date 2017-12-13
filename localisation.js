//init internationalization / localization class
var i18n_module = require('i18n-nodejs');


var config = {
    "lang": "de",
    "langFile": "./../../locale-greetings.json"//relative path to index.js file of i18n-nodejs module
};

module.exports.hello = new i18n_module("de", "./../../locale-greetings.json");
module.exports.zahlungsmittel = new i18n_module("de", "./../../locale-zahlungsmittel.json");
module.exports.spesenquittung = new i18n_module("de", "./../../locale-spesenquittung.json");
module.exports.gesperrt = new i18n_module("de", "./../../locale-gesperrt.json");
module.exports.security = new i18n_module("de", "./../../locale-security.json");