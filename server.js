'use strict';
console.log('13671719882'.substring(2, 5));
var restify = require('restify');
var config = require('./config');
var router = require('./common/router');
var auth = require('./common/auth');
var logger = require('./common/logger');
var server = restify.createServer(config.server);
var schedule = require('node-schedule');
var registrationDAO = require('./dao/registrationDAO');
var deviceDAO = require('./dao/deviceDAO');
var moment = require('moment');
var util = require('util');
var pusher = require('./domain/NotificationPusher');
restify.CORS.ALLOW_HEADERS.push('Access-Control-Allow-Origin');
server.use(restify.CORS());
server.opts(/.*/, function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", req.header("Access-Control-Request-Method"));
    res.header("Access-Control-Allow-Headers", req.header("Access-Control-Request-Headers"));
    res.send(200);
    return next();
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.dateParser());
server.use(restify.queryParser({
    mapParams: false
}));
server.use(restify.gzipResponse());
server.use(restify.bodyParser());
server.use(logger());
server.use(auth());
router.route(server);
server.on("uncaughtException", function (req, res, route, err) {
    res.send(err);
});

registrationDAO.findRegistrationByDate(moment().format('YYYY-MM-DD')).then(function (rs) {
    rs.length && rs.forEach(function (r) {
        var d = moment(moment(r.registerDate).format('YYYY-MM-DD') + ' ' + r.shiftPeriodName.split('-')[0], 'YYYY-MM-DD h:m').add(-1, 'h');
        if (!d.isBefore(moment())) {
            var k = schedule.scheduleJob(d.toDate(), function () {
                deviceDAO.findTokenByUid(r.patientBasicInfoId).then(function (tokens) {
                    if (tokens.length && tokens[0]) {
                        var notificationBody = util.format(config.outPatientReminderTemplate, r.patientName + (r.gender == 0 ? '先生' : '女士'),
                            r.hospitalName + r.departmentName + r.doctorName, moment(r.registerDate).format('YYYY-MM-DD') + ' ' + r.shiftPeriodName);
                        pusher.push({
                            body: notificationBody,
                            title: '就诊提醒',
                            audience: {registration_id: [tokens[0].token]},
                            patientName: r.patientName,
                            patientMobile: r.patientMobile,
                            uid: r.patientBasicInfoId
                        }, function (err, result) {
                            if (err) throw err;
                        });
                    }
                });
            });
        }
    })
});


server.listen(config.server.port, config.server.host, function () {
    console.log('%s listening at %s', server.name, server.url);
});
