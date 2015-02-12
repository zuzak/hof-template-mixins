# passport-template-mixins
A middleware that exposes a series of Mustache mixins on `res.locals` to ease usage of forms, translations, and some general needs.

Given options containing the `viewsDirectory` path, a `fields` object and a `sharedTranslationsKey` relative key on which to look for field and button translations shall, it shall return a middleware.
