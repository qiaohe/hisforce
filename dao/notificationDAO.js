"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (notification) {
        return db.query(sqlMapping.notification.insert, notification);
    },
    findNotifications: function(page){
        return db.query(sqlMapping.notification.findAll, [page.from, page.size]);
    }
}