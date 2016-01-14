"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (patientBasicInfo) {
        return db.query(sqlMapping.patient.insert, patientBasicInfo);
    },
    findById: function (patientId) {
        return db.query(sqlMapping.patient.findById, patientId);
    },
    findByMobile: function (mobile) {
        return db.query(sqlMapping.patient.findByMobile, mobile);
    },
    update: function (password, mobile) {
        return db.query(sqlMapping.patient.updatePwd, [password, mobile]);
    },
    findByUid: function (uid) {
        return db.query(sqlMapping.patient.findByUid, uid);
    },

    findByUidAndHospitalId: function (uid, hospitalId) {
        return db.query(sqlMapping.patient.findByUid, [uid, hospitalId]);
    },

    updateByUid: function (patientBasicInfo) {
        return db.query(sqlMapping.patient.updateById, [patientBasicInfo, patientBasicInfo.id]);
    },
    findContactByInvitationCode: function (invitationCode, inviteMobile) {
        return db.query(sqlMapping.patient.findContactByInvitationCode, [invitationCode, inviteMobile]);
    }
}