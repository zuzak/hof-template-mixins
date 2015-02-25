var mixins = require('../lib/template-mixins');

var Hogan = require('hogan.js');

function translate(key) {
    return key;
}

describe('Template Mixins', function () {

    var req, res, next, render, middleware;

    beforeEach(function () {
        req = {};
        res = {
            locals: {}
        };
        next = sinon.stub();
        render = sinon.stub();
        sinon.stub(Hogan, 'compile').returns({
            render: render
        });
    });

    afterEach(function () {
        Hogan.compile.restore();
    });

    it('returns a middleware', function () {
        mixins().should.be.a('function');
        mixins().length.should.equal(3);
    });

    it('calls next', function () {
        mixins()(req, res, next);
        next.should.have.been.calledOnce;
    });

    describe('input-text', function () {

        beforeEach(function () {
            middleware = mixins(translate, {});
        });

        it('adds a function to res.locals', function () {
            middleware(req, res, next);
            res.locals['input-text'].should.be.a('function');
        });

        it('returns a function', function () {
            middleware(req, res, next);
            res.locals['input-text']().should.be.a('function');
        });

        it('looks up field label', function () {
            middleware(req, res, next);
            res.locals['input-text']().call(res.locals, 'field-name');
            render.should.have.been.calledWith(sinon.match({
                label: 'fields.field-name.label'
            }));
        });

        it('prefixes translation lookup with namespace if provided', function () {
            middleware = mixins(translate, {}, { sharedTranslationsKey: 'name.space' });
            middleware(req, res, next);
            res.locals['input-text']().call(res.locals, 'field-name');
            render.should.have.been.calledWith(sinon.match({
                label: 'name.space.fields.field-name.label'
            }));
        });

    });

    describe('input-submit', function () {

        beforeEach(function () {
            middleware = mixins(translate, {});
        });

        it('adds a function to res.locals', function () {
            middleware(req, res, next);
            res.locals['input-submit'].should.be.a('function');
        });

        it('returns a function', function () {
            middleware(req, res, next);
            res.locals['input-submit']().should.be.a('function');
        });

        it('looks up button value with default key of "next"', function () {
            middleware(req, res, next);
            res.locals['input-submit']().call(res.locals);
            render.should.have.been.calledWith(sinon.match({
                value: 'buttons.next'
            }));
        });

        it('looks up button value with key if provided', function () {
            middleware(req, res, next);
            res.locals['input-submit']().call(res.locals, 'button-id');
            render.should.have.been.calledWith(sinon.match({
                value: 'buttons.button-id'
            }));
        });

        it('prefixes translation lookup with namespace if provided', function () {
            middleware = mixins(translate, {}, { sharedTranslationsKey: 'name.space' });
            middleware(req, res, next);
            res.locals['input-submit']().call(res.locals, 'button-id');
            render.should.have.been.calledWith(sinon.match({
                value: 'name.space.buttons.button-id'
            }));
        });

    });

});
