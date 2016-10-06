'use strict';

var _ = require('underscore');
var helpers = require('./helpers');

module.exports = function (options) {
    var fields = options.fields;
    var getTranslationKey = options.getTranslationKey;
    var conditionalTranslate = options.conditionalTranslate;
    var hoganTranslate = options.hoganTranslate;
    var maxlength = options.maxlength;
    var classNames = options.classNames;
    var type = options.type;

    return function inputText(key, extension) {
        var hKey = getTranslationKey(key, 'hint');
        var lKey = getTranslationKey(key, 'label');
        var hint = conditionalTranslate(hKey);

        var required = function isRequired() {
            var r = false;

            if (fields[key]) {
                if (fields[key].required !== undefined) {
                    return fields[key].required;
                } else if (fields[key].validate) {
                    var hasRequiredValidator = _.indexOf(fields[key].validate, 'required') !== -1;

                    return hasRequiredValidator ? true : false;
                }
            }

            return r;
        }();

        extension = extension || {};

        var autocomplete;
        if (fields[key] && typeof fields[key].autocomplete === 'string') {
            autocomplete = fields[key].autocomplete;
        } else if (typeof extension.autocomplete === 'string' && extension.autocomplete) {
            autocomplete = extension.autocomplete;
        }

        return _.extend(extension, {
            id: key,
            className: extension.className || classNames(key),
            type: extension.type || type(key),
            value: this.values && this.values[key],
            label: hoganTranslate(lKey),
            labelClassName: classNames(key, 'labelClassName') || 'form-label-bold',
            hint: hint,
            hintId: extension.hintId || (hint ? key + '-hint' : null),
            error: this.errors && this.errors[key],
            maxlength: maxlength(key) || extension.maxlength,
            required: required,
            pattern: extension.pattern,
            date: extension.date,
            autocomplete: autocomplete,
            attributes: fields[key] && fields[key].attributes
        });
    };
};
