var phrases;

exports.connect = function () {
    phrases = require('./ru');
};

exports.getPhrase = function (phrase) {
    if (!phrases[phrase]) {
        throw new Error('No such phrase in the dictionary: ' + phrase);
    }
    return phrases[phrase];
};