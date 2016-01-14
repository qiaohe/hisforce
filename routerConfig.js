var authController = require('./controller/authController');
var thirdPartyController = require('./controller/thirdPartyController');
var hospitalController = require('./controller/hospitalController');
var patientController = require('./controller/patientController');
var deviceController = require('./controller/deviceController');
module.exports = [
    {
        method: "post",
        path: "/api/register",
        handler: authController.register
    },
    {
        method: "post",
        path: "/api/login",
        handler: authController.login
    },
    {
        method: "post",
        path: "/api/logout",
        handler: authController.logout
    },
    {
        method: "post",
        path: "/api/resetPwd",
        handler: authController.resetPwd
    },
    {
        method: "get",
        path: "/api/sms/:mobile",
        handler: thirdPartyController.sendSMS
    },
    {
        method: "get",
        path: "/api/hospitals/search",
        handler: hospitalController.searchHospital
    },
    {
        method: "get",
        path: "/api/hospitals",
        handler: hospitalController.getHospitals
    },
    {
        method: "get",
        path: "/api/doctors/search",
        handler: hospitalController.searchDoctor
    },
    {
        method: "get",
        path: "/api/search",
        handler: hospitalController.search
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId/departments",
        handler: hospitalController.getDepartments
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId/departments/:departmentId/doctors",
        handler: hospitalController.getDoctorsByDepartment
    },
    {
        method: "get",
        path: "/api/hospitals/:hospitalId",
        handler: hospitalController.getHospitalById
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId",
        handler: hospitalController.getDoctorById,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/ad/images",
        handler: thirdPartyController.getAdImages
    },
    {
        method: "get",
        path: "/api/doctors/:doctorId/shiftPlans",
        handler: hospitalController.getShitPlan
    },
    {
        method: "post",
        path: "/api/preRegistration",
        handler: patientController.preRegistration,
        secured: "user"
    },
    {
        method: "put",
        path: "/api/preRegistration",
        handler: patientController.changePreRegistration,
        secured: "user"
    },
    {
        method: "del",
        path: "/api/preRegistration/:rid",
        handler: patientController.removePreRegistration,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/preRegistration",
        handler: patientController.getMyPreRegistrations,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/favorites/doctors",
        handler: patientController.favoriteDoctor,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/favorites/doctors",
        handler: patientController.getFavouritedDoctors,
        secured: "user"
    },

    {
        method: "get",
        path: "/api/preRegistration/:rid/doctors",
        handler: patientController.getDoctorsWithSameRegistrationId,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/prePaidCards",
        handler: patientController.getPrePaidCards,
        secured: "user"
    },
    {
        method: "get",
        path: "/api/transactionFlows",
        handler: patientController.getTransactionFlows,
        secured: "user"
    },
    {
        method: "post",
        path: "/api/acceptInvitation",
        handler: patientController.acceptInvitation,
        secured: "user"
    },

    {
        method: "get",
        path: "/api/me",
        handler: patientController.getMemberInfo,
        secured: "user"
    },
    {
        method: "put",
        path: "/api/me",
        handler: patientController.updateMemberInfo,
        secured: "user"
    },
    {
        method: 'get',
        path: '/api/qiniu/token',
        handler: thirdPartyController.getQiniuToken
    },
    {
        method: "post",
        path: "/api/devices",
        handler: deviceController.addDevice,
        secured: 'user'
    },
    {
        method: "post",
        path: "/api/notifications",
        handler: deviceController.pushNotification,
        secured: 'user'
    },
    {
        method: "get",
        path: "/api/notifications",
        handler: deviceController.getNotifications,
        secured: 'user'
    }
];