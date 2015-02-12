'use strict';

var fs = require('fs'),
    path = require('path');

var Hogan = require('hogan.js'),
    _ = require('underscore'),
    moment = require('moment');

module.exports = function (t, viewsDirectory, fields, sharedTranslationsKey) {

    // This code probably does not need this as the only time it is used
    // only a single key is passed in.
    var i18nLookup = require('./i18n-property')(t);

    // This middleware places template mixins against the `res.locals` object.

    // Options contains:
    // - viewsDirectory: The folder in which the templates are stored is passed in.
    // - fields: This stores data needed to generate
    //   a mixin, like the options available or the validation properties.)
    // - A `sharedTranslationsKey` is also given: this is used to
    //   find translations relatively within the translation.json
    //   particularly for field and button labels.
    viewsDirectory = viewsDirectory || path.resolve(__dirname, '../');
    fields = fields || {};
    sharedTranslationsKey = sharedTranslationsKey || 'shared';

    var templates = [
        'partials/forms/input-text-group',
        'partials/forms/input-submit',
        'partials/forms/radio-group',
        'partials/forms/select',
        'partials/forms/checkbox'
    ];
    var compiled = {};

    // TODO: Currently the views extension is assumed.
    // TODO: Currently the synchronous compile step happens here and knows its own templates
    //       already.
    // TODO: We should use an options object to specify the defaults.
    // TODO: We should allow a user to override the partials locations.
    // TODO: We should document the code better.
    // TODO: We should show an example of the PEX project using this.
    // TODO: We should expose the names of the mixins in the README.md.
    // TODO: Simplify the interface.
    // TODO: Separate form related from general from translation related.
    _.each(templates, function (template) {
        var templatePath = path.join(viewsDirectory, template + '.html');;
        compiled[template] = Hogan.compile(fs.readFileSync(templatePath).toString());
    });

    function maxlength(key) {
        var validation = fields[key] && fields[key].validate || [];
        var ml = _.findWhere(validation, { type: 'maxlength' }) || _.findWhere(validation, { type: 'exactlength' });
        if (ml) {
            return _.isArray(ml.arguments) ? ml.arguments[0] : ml.arguments;
        } else {
            return null;
        }
    }

    function type(key) {
        return fields[key] && fields[key].type || 'text';
    }

    function display(key) {
        return fields[key] && fields[key].display;
    }

    function inputText(key, extension) {
        extension = extension || {};
        return _.extend(extension, {
            id: key,
            type: extension.type || type(key),
            value: this.values && this.values[key],
            label: t(sharedTranslationsKey + '.fields.' + key + '.label'),
            hint: i18nLookup(sharedTranslationsKey + '.fields.' + key + '.hint'),
            error: this.errors && this.errors[key],
            maxlength: extension.maxlength || maxlength(key),
            required: extension.required !== undefined ? extension.required : true,
            pattern: extension.pattern
        });
    }

    function optionGroup(key) {
        return {
            key: key,
            error: this.errors && this.errors[key],
            options: _.map(fields[key].options, function (label) {
                var selected = false, value;

                if (typeof label === 'string') {
                    value = label;
                } else {
                    value = label.value;
                    label = label.label;
                }

                if (this.values && this.values[key] !== undefined) {
                    selected = this.values[key] === value;
                }
                return {
                    label: t(label),
                    value: value,
                    selected: selected
                };
            }, this),
            display: display(key)
        };
    }

    function checkbox(key, options) {
        options = options || {};
        options.required = options.required || false;
        var selected = false;
        if (this.values && this.values[key] !== undefined) {
            selected = this.values[key].toString() === 'true';
        }
        return _.extend(options, {
            key: key,
            error: this.errors && this.errors[key],
            invalid: this.errors && this.errors[key] && options.required,
            label: t(sharedTranslationsKey + '.fields.' + key + '.label'),
            selected: selected
        });
    }

    return function (req, res, next) {

        res.locals['input-text'] = function () {
            return function (key) {
                return compiled['partials/forms/input-text-group'].render(inputText.call(this, key));
            };
        };

        res.locals['input-date'] = function () {
            return function (key) {
                var parts = [
                    compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-day', { pattern: '[0-9]*', min: 1, max: 31, maxlength: 2, class: 'date-input' })),
                    compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-month', { pattern: '[0-9]*', min: 1, max: 12, maxlength: 2, class: 'date-input' })),
                    compiled['partials/forms/input-text-group'].render(inputText.call(this, key + '-year', { pattern: '[0-9]*', maxlength: 4, class: 'date-input' }))
                ];
                return parts.join('\n');
            };
        };

        res.locals['input-text-compound'] = function () {
            return function (key) {
                var obj = { compound: true };
                return compiled['partials/forms/input-text-group'].render(inputText.call(this, key, obj));
            };
        };

        res.locals['input-text-hidden-label'] = function () {
            return function (key) {
                var obj = {
                    hiddenLabel: true,
                    required: false
                };
                return compiled['partials/forms/input-text-group'].render(inputText.call(this, key, obj));
            };
        };

        res.locals['input-text-postcode'] = function () {
            return function (key) {
                var obj = {
                    postcode: true,
                    class: 'uppercase'
                };
                return compiled['partials/forms/input-text-group'].render(inputText.call(this, key, obj));
            };
        };

        res.locals['input-phone'] = function () {
            return function (key) {
                return compiled['partials/forms/input-text-group'].render(inputText.call(this, key, { maxlength: 18 }));
            };
        };

        res.locals['radio-group'] = function () {
            return function (key) {
                return compiled['partials/forms/radio-group'].render(optionGroup.call(this, key));
            };
        };

        res.locals.select = function () {
            return function (key) {
                return compiled['partials/forms/select'].render(inputText.call(this, key, optionGroup.call(this, key)));
            };
        };

        res.locals.checkbox = function () {
            return function (key) {
                return compiled['partials/forms/checkbox'].render(checkbox.call(this, key));
            };
        };

        res.locals['checkbox-compound'] = function () {
            var options = { compound: true };
            return function (key) {
                return compiled['partials/forms/checkbox'].render(checkbox.call(this, key, options));
            };
        };

        res.locals['checkbox-required'] = function () {
            var options = { required: true };
            return function (key) {
                return compiled['partials/forms/checkbox'].render(checkbox.call(this, key, options));
            };
        };

        /**
        * props: '[value] [id]'
        */
        res.locals['input-submit'] = function () {
            return function (props) {
                props = props.split(' ');
                var def = 'next',
                    value = props[0] || def,
                    id = props[1];

                var obj = {
                    value: t(sharedTranslationsKey + '.buttons.' + value),
                    id: id
                };
                return compiled['partials/forms/input-submit'].render(obj);
            };
        };

        res.locals.currency = function () {
            return function (txt) {
                var value = parseFloat(Hogan.compile(txt).render(this));
                if (isNaN(value)) {
                    return txt;
                } else if (value % 1 === 0) {
                    value = value.toString();
                } else {
                    value = value.toFixed(2);
                }
                return '£' + value;
            };
        };

        res.locals.date = function () {
            return function (txt) {
                var value = Hogan.compile(txt).render(this);
                return moment(value).format('D MMMM YYYY');
            };
        };

        res.locals.hyphenate = function () {
            return function (txt) {
                txt = txt || '';
                return Hogan.compile(txt).render(this).toLowerCase().replace(' ', '-');
            };
        };

        res.locals.uppercase = function () {
            return function (txt) {
                txt = txt || '';
                return Hogan.compile(txt).render(this).toUpperCase();
            };
        };

        res.locals.lowercase = function () {
            return function (txt) {
                txt = txt || '';
                return Hogan.compile(txt).render(this).toLowerCase();
            };
        };

        res.locals.selected = function () {
            return function (txt) {
                var bits = txt.split('='),
                    val;
                if (this.values && this.values[bits[0]] !== undefined) {
                    val = this.values[bits[0]].toString();
                }
                return val === bits[1] ? ' checked="checked"' : '';
            };
        };

        /**
        * Use on whole sentences
        */
        res.locals.time = function () {
            return function (txt) {
                txt = txt || '';
                txt = Hogan.compile(txt).render(this);
                txt = txt.replace(/12:00am/i, 'midnight').replace(/^midnight/, 'Midnight');
                txt = txt.replace(/12:00pm/i, 'midday').replace(/^middday/, 'Midday');
                return txt;
            };
        };

        res.locals.t = function () {
            return function (txt) {
                txt = Hogan.compile(txt).render(this);
                return t.apply(req, [txt, this]);
            };
        };

        next();
    };

};
