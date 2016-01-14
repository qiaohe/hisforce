'use strict';
var Promise = require('bluebird');
var using = Promise.using;
Promise.promisifyAll(require('mysql/lib/Connection').prototype);
Promise.promisifyAll(require('mysql/lib/Pool').prototype);
var options = require('../config').db;
var db = {};
var mysql = require('mysql');
var pool = mysql.createPool(options);
db.query = function (sql, values) {
    return using(pool.getConnectionAsync().disposer(function (connection) {
        return connection.destroy();
    }), function (connection) {
        return connection.queryAsync(sql, values).then(function (result) {
            return result[0];
        }).catch(function (err) {
            throw err;
        });
    });
};
module.exports = db;
