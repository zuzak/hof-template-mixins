'use strict';

var _ = require('underscore');
var Hogan = require('hogan.js');

function hoganTranslate(sharedTranslationsKey, locals, translate, key) {
    return hoganRender(locals, translate(sharedTranslationsKey + key), this);
}

function hoganRender (locals, text, ctx) {
    if (!text) { return ''; }
    ctx = _.extend({}, locals, ctx);
    return Hogan.compile(text).render(ctx);
}

// Like hoganTranslate() but returns null on failed translations
function conditionalTranslate(sharedTranslationsKey, translate, key) {
    key = sharedTranslationsKey + key;
    var translated = translate(key);
    return translated !== key ? translated : null;
};

function getTranslationKey(fields, key, property) {
    return fields && fields[key] && fields[key][property] ? fields[key][property] : 'fields.' + key + '.' + property;
};

function maxlength(fields, key) {
    var validation = fields[key] && fields[key].validate || [];
    var ml = _.findWhere(validation, { type: 'maxlength' }) || _.findWhere(validation, { type: 'exactlength' });
    if (ml) {
        return _.isArray(ml.arguments) ? ml.arguments[0] : ml.arguments;
    } else {
        return null;
    }
}

function classNameString(name) {
    if (Array.isArray(name)) {
        return name.join(' ');
    } else {
        return name;
    }
}

function classNames(fields, key, prop) {
    prop = prop || 'className';
    if (fields[key] && fields[key][prop]) {
        return classNameString(fields[key][prop]);
    } else {
        return '';
    }
}

function type(fields, key) {
    return fields[key] && fields[key].type || 'text';
}

module.exports = function (fields, translate, sharedTranslationsKey, res, ctx) {
    return {
        hoganTranslate: hoganTranslate.bind(ctx, sharedTranslationsKey, res.locals, translate),
        hoganRender: hoganRender.bind(null, res.locals),
        conditionalTranslate: conditionalTranslate.bind(ctx, sharedTranslationsKey, translate),
        getTranslationKey: getTranslationKey.bind(null, fields),
        maxlength: maxlength.bind(null, fields),
        classNames: classNames.bind(null, fields),
        classNameString: classNameString,
        type: type.bind(null, fields)
    };
};
