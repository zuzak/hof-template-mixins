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

    describe('input-date', function () {

        beforeEach(function () {
            middleware = mixins(translate, {});
        });

        it('adds a function to res.locals', function () {
            middleware(req, res, next);
            res.locals['input-date'].should.be.a('function');
        });

        it('returns a function', function () {
            middleware(req, res, next);
            res.locals['input-date']().should.be.a('function');
        });

        it('renders thrice if the field is not marked as inexact', function () {
            middleware(req, res, next);
            res.locals['input-date']().call(res.locals, 'field-name');
            render.should.have.been.calledThrice;
        });

        it('renders twice if the field is marked as inexact', function () {
            var middlewareWithFieldNameMarkedAsInexact = mixins(translate, {
                'field-name': {
                    'inexact': true
                }
            });
            middlewareWithFieldNameMarkedAsInexact(req, res, next);
            res.locals['input-date']().call(res.locals, 'field-name');
            render.should.have.been.calledTwice;
        });

        it('looks up field label', function () {
            middleware(req, res, next);
            res.locals['input-date']().call(res.locals, 'field-name');

            render.called;

            var dayCall = render.getCall(0),
                monthCall = render.getCall(1),
                yearCall = render.getCall(2);

            dayCall.should.have.been.calledWith(sinon.match({
              label: 'fields.field-name-day.label'
            }));

            monthCall.should.have.been.calledWith(sinon.match({
              label: 'fields.field-name-month.label'
            }));

            yearCall.should.have.been.calledWith(sinon.match({
              label: 'fields.field-name-year.label'
            }));
        });

        it('prefixes translation lookup with namespace if provided', function () {
            middleware = mixins(translate, {}, { sharedTranslationsKey: 'name.space' });
            middleware(req, res, next);
            res.locals['input-date']().call(res.locals, 'field-name');

            render.called;

            var dayCall = render.getCall(0),
                monthCall = render.getCall(1),
                yearCall = render.getCall(2);

            dayCall.should.have.been.calledWith(sinon.match({
              label: 'name.space.fields.field-name-day.label'
            }));

            monthCall.should.have.been.calledWith(sinon.match({
              label: 'name.space.fields.field-name-month.label'
            }));

            yearCall.should.have.been.calledWith(sinon.match({
              label: 'name.space.fields.field-name-year.label'
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

    describe('date', function () {

        beforeEach(function () {
            middleware = mixins(translate, {});
        });

        it('adds a function to res.locals', function () {
            middleware(req, res, next);
            res.locals['date'].should.be.a('function');
        });

        it('returns a function', function () {
            middleware(req, res, next);
            res.locals['date']().should.be.a('function');
        });

        it('formats a date', function () {
            middleware(req, res, next);
            res.locals['date']().call(res.locals, '2015-03-26').should.equal('26 March 2015');
        });

        it('applys a date format if specified', function () {
            middleware(req, res, next);
            res.locals['date']().call(res.locals, '2015-03|MMMM YYYY').should.equal('March 2015');
        });

    });

});
