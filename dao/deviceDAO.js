"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (device) {
        return db.query(sqlMapping.device.insert, device);
    },
    findByToken: function (token) {
        return db.query(sqlMapping.device.findByToken, token);
    },
    update: function (device) {
        return db.query(sqlMapping.device.update, [device, device.id]);
    },
    findTokenByUid: function (uid) {
        return db.query(sqlMapping.device.findTokenByUid, uid);
    },
    findByUid: function (uid) {
        return db.query(sqlMapping.device.findByUid, uid);
    },
}