"use strict";
var Promise = require('bluebird');
var jwt = Promise.promisifyAll(require("jsonwebtoken"));
var i18n = require('../i18n/localeMessage');
var config = require('../config');
var routeConfig = require('../routerConfig');
var _ = require('lodash');
var redisClient = require('./redisClient');
var url = require('url');
function authorizedIfNeeded(req) {
    var routeItem = _.findLast(routeConfig, function (item) {
        var regExp = new RegExp('^' + item.path.replace(/:[a-zA-Z0-9]*/g, '\\w+') + '$');
        var m = req.method.toLowerCase();
        return (m == item.method || (m == 'delete' && item.method == 'del')) && regExp.test(url.parse(req.url).pathname)
    });
    return routeItem && routeItem.secured;
}

function auth() {
    function ensureAuthorized(req, res, next) {
        if (!authorizedIfNeeded(req)) return next();
        var token = req.headers['token'] || req.query.token || req.body.token;
        if (!token) return res.send(403, i18n.get("access.not.authorized"));
        jwt.verifyAsync(token, config.app.tokenSecret).then(function (user) {
            if (user.exp * 1000 <= Date.now()) return res.send(403, i18n.get("token.expired"));
            req.user = user;
        }).then(function () {
            return redisClient.getAsync(token);
        }).then(function (reply) {
            if (!reply) return res.send(403, i18n.get("token.invalid"));
            return next();
        }).catch(function (err) {
            res.send(500, err);
        });
    }

    return (ensureAuthorized);
}
module.exports = auth;