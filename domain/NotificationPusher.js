"use strict";
var config = require('../config');
var notificationDAO = require('../dao/notificationDAO');
var JPush = require("jpush-sdk");
module.exports = {
    push: function (notification, callback) {
        var client = JPush.buildClient(config.jpush.appKey, config.jpush.masterSecret);
        client.push().setPlatform(JPush.ALL)
            .setAudience(notification.audience ? notification.audience : JPush.ALL).
            setNotification(notification.body, JPush.android(notification.body, notification.title, 1, notification.extra))
            .send(function (err, response) {
                if (err) throw err;
                notificationDAO.insert({
                    body: notification.body, title: notification.title, extra: JSON.stringify(notification.extra),
                    createDate: new Date(), sendno: response.sendno, msg_id: response.msg_id
                }).then(function (result) {
                    return callback(err, result);
                })
            });
    }
}