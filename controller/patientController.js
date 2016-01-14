"use strict";
var config = require('../config');
var redis = require('../common/redisClient');
var i18n = require('../i18n/localeMessage');
var registrationDAO = require('../dao/registrationDAO');
var hospitalDAO = require('../dao/hospitalDAO');
var patientDAO = require('../dao/patientDAO');
var deviceDAO = require('../dao/deviceDAO');
var _ = require('lodash');
var request = require('request');
var moment = require('moment');
var pusher = require('../domain/NotificationPusher');
var util = require('util');
module.exports = {
    preRegistration: function (req, res, next) {
        var registration = req.body;
        registration.createDate = new Date();
        registration.patientBasicInfoId = req.user.id;
        registration.hospitalId = req.user.hospitalId;
        patientDAO.findById(req.user.id).then(function (basicInfoIds) {
            registration.patientName = basicInfoIds[0].name;
            registration.patientMobile = basicInfoIds[0].mobile;
            registration.gender = basicInfoIds[0].gender;
            return registrationDAO.findPatientByBasicInfoIdAndHospitalId(req.user.id, registration.hospitalId)
        }).then(function (patients) {
            if (patients.length) {
                registration.patientId = patients[0].id;
            } else {
                return redis.incrAsync('member.no.incr').then(function (memberNo) {
                    return registrationDAO.insertPatient({
                        patientBasicInfoId: req.user.id,
                        hospitalId: registration.hospitalId,
                        memberType: 1,
                        balance:0.00,
                        memberCardNo: registration.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                        createDate: new Date()
                    }).then(function (result) {
                        registration.patientId = result.insertId;
                    });
                });
            }
        }).then(function () {
            return hospitalDAO.findDoctorById(registration.doctorId);
        }).then(function (doctors) {
            var doctor = doctors[0];
            registration.departmentId = doctor.departmentId;
            registration.departmentName = doctor.departmentName;
            registration.hospitalId = doctor.hospitalId;
            registration.hospitalName = doctor.hospitalName;
            registration.registrationFee = doctor.registrationFee;
            registration.doctorName = doctor.name;
            registration.doctorJobTitle = doctor.jobTitle;
            registration.doctorJobTitleId = doctor.jobTitleId;
            registration.doctorHeadPic = doctor.headPic;
            registration.status = 0;
            registration.registrationType = 0;
            registration.outPatientType = 0;
            registration.outpatientStatus = 5;
            registration.memberType = 1;
            registration.creator = req.user.id;
            return redis.incrAsync('doctor:' + registration.doctorId + ':d:' + registration.registerDate + ':incr').then(function (seq) {
                registration.sequence = seq;
                return registrationDAO.insert(registration)
            });
        }).then(function (result) {
            registration.id = result.insertId;
            return registrationDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
        }).then(function () {
            return registrationDAO.findShiftPeriodById(registration.hospitalId, registration.shiftPeriod);
        }).then(function (result) {
            deviceDAO.findTokenByUid(req.user.id).then(function (tokens) {
                if (tokens.length && tokens[0]) {
                    var notificationBody = util.format(config.registrationNotificationTemplate, registration.patientName,
                        registration.hospitalName, registration.departmentName, registration.sequence, registration.registerDate);
                    pusher.push({
                        body: notificationBody,
                        title: '预约挂号提醒',
                        audience: {registration_id: [tokens[0].token]},
                        patientName: registration.patientName,
                        patientMobile: registration.patientMobile,
                        uid: req.user.id
                    }, function (err, result) {
                        if (err) throw err;
                    });
                }
                return res.send({
                    ret: 0,
                    data: {
                        id: registration.id,
                        registerDate: registration.registerDate,
                        hospitalName: registration.hospitalName,
                        departmentName: registration.departmentName,
                        doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                        shiftPeriod: result[0].name
                    }
                });
            });
        });
        return next();
    },

    changePreRegistration: function (req, res, next) {
        var registration = req.body;
        registration.updateDate = new Date();
        registration.patientBasicInfoId = req.user.id;
        registrationDAO.findRegistrationById(registration.id).then(function (rs) {
            var oldRegistration = rs[0];
            return registrationDAO.updateShiftPlanDec(rs[0].doctorId, rs[0].registerDate, rs[0].shiftPeriod);
        }).then(function () {
            return hospitalDAO.findDoctorById(registration.doctorId)
        }).then(function (doctors) {
            var doctor = doctors[0];
            registration.departmentId = doctor.departmentId;
            registration.departmentName = doctor.departmentName;
            registration.hospitalId = doctor.hospitalId;
            registration.hospitalName = doctor.hospitalName;
            registration.registrationFee = doctor.registrationFee;
            registration.doctorName = doctor.name;
            registration.doctorJobTitle = doctor.jobTitle;
            registration.doctorJobTitleId = doctor.jobTitleId;
            registration.doctorHeadPic = doctor.headPic;
            registration.status = 3;
            registration.outPatientType = 0;
            registration.outpatientStatus = 5;
            return registrationDAO.updateRegistration(registration);
        }).then(function (result) {
            return registrationDAO.updateShiftPlan(registration.doctorId, registration.registerDate, registration.shiftPeriod);
        }).then(function (result) {
            return registrationDAO.findPatientByBasicInfoId(req.user.id);
        }).then(function () {
            return registrationDAO.findShiftPeriodById(registration.hospitalId, registration.shiftPeriod);
        }).then(function (result) {
            return res.send({
                ret: 0,
                data: {
                    registerDate: registration.registerDate,
                    hospitalName: registration.hospitalName,
                    departmentName: registration.departmentName,
                    doctorName: registration.doctorName, jobTtile: registration.doctorJobTtile,
                    shiftPeriod: result[0].name
                }
            });
        });
        return next();
    },
    removePreRegistration: function (req, res, next) {
        var rid = req.params.rid;
        var registration = {};
        registrationDAO.findRegistrationById(rid).then(function (rs) {
            registration = rs[0];
            return registrationDAO.updateShiftPlanDec(registration.doctorId, moment(registration.registerDate).format('YYYY-MM-DD'), registration.shiftPeriod)
        }).then(function () {
            return registrationDAO.updateRegistration({id: rid, status: 4, updateDate: new Date()})
        }).then(function () {
            res.send({ret: 0, message: i18n.get('preRegistration.cancel.success')});
        });
        return next();
    },
    favoriteDoctor: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'uid:' + uid + ':favorite:' + 'doctors';
        var doctorId = req.body.doctorId;
        var result = {uid: uid, doctorId: doctorId, favourited: true};
        redis.zrankAsync(queue, doctorId).then(function (index) {
            if (index == null) return redis.zadd(queue, new Date().getTime(), doctorId);
            result.favourited = false;
            return redis.zrem(queue, doctorId);
        }).then(function () {
            res.send({ret: 0, data: result});
        });
        return next();
    },
    getFavouritedDoctors: function (req, res, next) {
        var uid = req.user.id;
        var queue = 'uid:' + uid + ':favorite:' + 'doctors';
        redis.zrangeAsync([queue, +req.query.from, +req.query.from + (+req.query.size) - 1]).then(function (ids) {
            if (!ids.length) return [];
            return hospitalDAO.findDoctorByIds(ids.join(','));
        }).then(function (doctors) {
            res.send({ret: 0, data: doctors});
        });
        return next();
    },
    getMyPreRegistrations: function (req, res, next) {
        var uid = req.user.id;
        registrationDAO.findRegistrationByUid(uid, {
            from: +req.query.from,
            size: +req.query.size
        }).then(function (registrations) {
            registrations && registrations.forEach(function (registration) {
                registration.status = config.registrationStatus[registration.status];
            });
            res.send({ret: 0, data: registrations});
        });
        return next();
    },

    getDoctorsWithSameRegistrationId: function (req, res, next) {
        var rid = req.params.rid;
        registrationDAO.findRegistrationById(rid).then(function (registrations) {
            var r = registrations[0];
            return registrationDAO.findDoctorsBy(r.departmentId, r.registrationFee);
        }).then(function (doctors) {
            return res.send({ret: 0, data: doctors});
        });
        return next();
    },
    getPrePaidCards: function (req, res, next) {
        var uid = req.user.id;
        patientDAO.findByUid(uid).then(function (cards) {
            if (!cards.length) return res.send({ret: 0, data: []});
            cards.forEach(function (card) {
                card.memberType = config.memberType[card.memberType];
                card.source = config.sourceType[card.source];
            });
            res.send({ret: 0, data: cards});
        });
        return next();
    },

    getTransactionFlows: function (req, res, next) {
        hospitalDAO.findTransactionFlowsByUid(req.user.id, +req.query.from, +req.query.size).then(function (flows) {
            if (!flows.length) return res.send({ret: 0, data: []});
            flows.forEach(function (flow) {
                flow.type = config.transactionType[flow.type];
            });
            return res.send({ret: 0, data: flows});
        });
        return next();
    },
    getMemberInfo: function (req, res, next) {
        var uid = req.user.id;
        patientDAO.findById(uid).then(function (members) {
            res.send({ret: 0, data: members[0]});
        });
        return next();
    },
    updateMemberInfo: function (req, res, next) {
        req.body.id = req.user.id;
        patientDAO.updateByUid(req.body).then(function (result) {
            return patientDAO.findById(req.user.id);
        }).then(function (members) {
            res.send({ret: 0, data: members[0]});
        });
        return next();
    },
    acceptInvitation: function (req, res, next) {
        var uid = req.user.id;
        var contact = {};
        patientDAO.findContactByInvitationCode(req.body.invitationCode, req.user.mobile).then(function (contacts) {
            if (!contacts.length) return res.send({ret: 1, message: i18n.get('invitation.code.invalid')});
            contact = contacts[0];
            return registrationDAO.findPatientByBasicInfoIdAndHospitalId(req.user.id, contact.hospitalId);
        }).then(function (patients) {
            if (!patients.length) {
                return redis.incrAsync('member.no.incr').then(function (memberNo) {
                    return registrationDAO.insertPatient({
                        patientBasicInfoId: req.user.id,
                        hospitalId: contact.hospitalId,
                        memberType: 1,
                        source: contact.source,
                        balance:0.00,
                        recommender: contact.businessPeopleId,
                        memberCardNo: contact.hospitalId + '-1-' + _.padLeft(memberNo, 7, '0'),
                        createDate: new Date()
                    });
                });
            } else {
                return res.send({ret: 1, message: i18n.get('invitation.used.success')});
            }
        }).then(function (result) {
            return patientDAO.findByUidAndHospitalId(req.user.id, contact.hospitalId);
        }).then(function (cards) {
            var message = config.app.welcomeMessage.replace(':hospital', contact.hospitalName);
            var options = {
                url: config.app.imServer,
                method: 'POST',
                json: true,
                headers: {'token': req.headers['token'] || req.query.token || req.body.token},
                body: {
                    receiverId: req.user.id,
                    isPatient: 'true',
                    message: message,
                    sender: {uid: 1, isPatient: false}
                }
            };
            request.post(options, function callback(error, response, data) {
                console.log(response);
            });
            cards[0].source = config.sourceType[cards[0].source];
            return res.send({ret: 0, data: cards[0]});
        });
        return next();
    }
}