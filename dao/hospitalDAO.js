"use strict";
var db = require('../common/db');
var sqlMapping = require('./sqlMapping');
var moment = require('moment');
module.exports = {
    searchHospital: function (name, page) {
        return db.query('select id, name, tag, icon from Hospital where name like \'%' + name + '%\' limit ' + page.from + ',' + page.size);
    },

    searchDoctor: function (name, page) {
        return db.query('select id, name, departmentName, hospitalName, headPic,registrationFee, speciality,jobTitle from Doctor where name like \'%' + name + '%\' limit ' + page.from + ',' + page.size);
    },

    findAll: function (page) {
        return db.query('select Hospital.id, name, tag, icon, concat(city.province,city.city) as city from Hospital left join city on city.cityId = Hospital.cityId  limit ' + page.from + ',' + page.size)
    },

    findDepartmentsBy: function (hospitalId) {
        return db.query(sqlMapping.department.findByHospital, hospitalId);
    },

    findDoctorsByDepartment: function (hospitalId, departmentId) {
        return db.query(sqlMapping.doctor.findByDepartment, [hospitalId, departmentId]);
    },

    findHospitalById: function (hospitalId) {
        return db.query(sqlMapping.hospital.findById, hospitalId);
    },

    findHospitalByIdWith: function (hospitalId) {
        return db.query(sqlMapping.hospital.findByIdWith, hospitalId);
    },

    findDoctorByIds: function (ids) {
        var sql = 'select id, name, departmentName,hospitalId, hospitalName, headPic,registrationFee, speciality,jobTitle ' +
            'from Doctor where id in(' + ids + ') order by field(id, ' + ids + ')';
        return db.query(sql);
    },

    findHospitalsByIds: function (ids) {
        var sql = 'select id, name, tag, images, address, icon, introduction from Hospital where id in(' + ids + ') order by field(id, ' + ids + ')';
        return db.query(sql);
    },

    findDoctorById: function (doctorId) {
        return db.query(sqlMapping.doctor.findById, doctorId);
    },

    findShiftPlans: function (doctorId, start) {
        var end = moment(start).add(1, 'w').format('YYYY-MM-DD');
        return db.query(sqlMapping.doctor.findShitPlans, [doctorId, start, end]);
    },

    findTransactionFlowsByUid: function (uid, from, size) {
        return db.query(sqlMapping.transactionFlow.findByUid, [uid, from, size]);
    },
    findCustomerServiceId: function (hospitalId) {
        return db.query(sqlMapping.hospital.findCustomerServiceId, hospitalId);
    }

}
