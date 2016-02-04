"use strict";
var config = require('../config');
var _ = require('lodash');
var deviceDAO = require('../dao/deviceDAO');
var i18n = require('../i18n/localeMessage');
var pusher = require('../domain/NotificationPusher');
var notificationDAO = require('../dao/notificationDAO');
module.exports = {
    addDevice: function (req, res, next) {
        var device = req.body;
        device.createDate = new Date();
        if (!device.token) return res.send({ret:0, message:'无效的Token'});
        deviceDAO.findByUid(device.uid).then(function (oldDevice) {
            if (oldDevice.length) device.id = oldDevice[0].id;
            return oldDevice.length ? deviceDAO.update(device) : deviceDAO.insert(device);
        }).then(function (result) {
            return res.send({ret: 0, message: i18n.get('device.add.success')})
        }).catch(function (err) {
            return res.send({ret: 1, message: err.message})
        });
        return next();
    },
    pushNotification: function (req, res, next) {
        pusher.push(req.body, function (err, result) {
            if (err) throw err;
            if (result) res.send({ret: 0, message: i18n.get('notification.send.success')});
        });
        return next();
    },
    getNotifications: function (req, res, next) {
        var uid = req.user.id;
        notificationDAO.findNotifications(uid, {from: +req.query.from, size: +req.query.size}).then(function (ns) {
            res.send({ret: 0, data: ns});
        });
        return next();
    }
}
