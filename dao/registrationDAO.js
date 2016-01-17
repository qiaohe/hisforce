"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
module.exports = {
    insert: function (registration) {
        return db.query(sqlMapping.registration.insert, registration);
    },
    insertPatient: function (patient) {
        return db.query(sqlMapping.hospital.insertPatient, patient);
    },

    findPatientByBasicInfoId: function (basicInfoId) {
        return db.query(sqlMapping.hospital.findPatientByBasicInfoId, basicInfoId);
    },

    findPatientByBasicInfoIdAndHospitalId: function (basicInfoId, hospitalId) {
        return db.query(sqlMapping.hospital.findPatientByBasicInfoIdAndHospitalId, [basicInfoId, hospitalId]);
    },

    updateShiftPlan: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.registration.updateShiftPlan, [doctorId, registerDate, shiftPeriod])
    },

    updateShiftPlanDec: function (doctorId, registerDate, shiftPeriod) {
        return db.query(sqlMapping.registration.updateShiftPlanDec, [doctorId, registerDate, shiftPeriod])
    },
    findShiftPeriodById: function (hospitalId, shiftPeriodId) {
        return db.query(sqlMapping.registration.findShiftPeriodById, [hospitalId, shiftPeriodId]);
    },

    findRegistrationById: function (rid) {
        return db.query(sqlMapping.registration.findById, rid);
    },

    updateRegistration: function (registration) {
        return db.query(sqlMapping.registration.updateRegistration, [registration, registration.id]);
    },
    findRegistrationByUid: function (uid, page) {
        return db.query(sqlMapping.registration.findRegistrationsByUid, [uid, page.from, page.size]);
    },
    findDoctorsBy: function (departmentId, registrationFee) {
        return db.query(sqlMapping.doctor.findBy, [departmentId, registrationFee]);
    },
    updateInvitationContact: function (contact) {
        return db.query(sqlMapping.patient.updateContact, [contact, contact.id]);
    },
    updatePerformance: function (businessPeopleId, yearMonth) {
        return db.query(sqlMapping.patient.updatePerformance, [businessPeopleId, yearMonth]);
    },
    findRegistrationByDate: function (date) {
        console.log(date)
        return db.query(sqlMapping.registration.findRegistrationsByDate, date);
    }
}