//init internationalization / localization class
var i18n_module = require('i18n-nodejs');


var config = {
    "lang": "de",
    "langFile": "./../../locale-greetings.json"//relative path to index.js file of i18n-nodejs module
};

module.exports = new i18n_module("de", "./../../localisation.json");