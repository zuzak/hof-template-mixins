'use strict';

var _ = require('underscore'),
    Hogan = require('hogan.js');

module.exports = function (t) {

    /**
     * Given an array of keys and a context iterate through
     * each of the keys until (1) the translated key is different
     * from the non-translated key, and (2) a template containing the
     * data from the context compiles successfully.
     */
    return function (keys, context) {
        if (typeof keys === 'string') {
            keys = [keys];
        }

        return _.reduce(keys, function (message, token) {
            if (!message && i18n.t(token) !== token) {
                try {
                    message = Hogan.compile(t(token)).render(context || {});
                } catch (e) {}
            }
            return message;
        }, null);

    };
};
