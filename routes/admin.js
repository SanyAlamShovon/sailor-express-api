const router = require('express').Router();
const { celebrate } = require('celebrate');
const adminController = require('./../controllers/adminController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const adminValidation = require('./../validations/adminValidation');
const limiter = require('./../config/rateLimit');

router.route('/create')
    .post([
            celebrate(adminValidation.createAdmin),
            verifyToken,userPermission('admin')
        ],
        adminController.createAdmin
    )

router.route('/dashboard')
    .get([
            verifyToken,userPermission('admin','incharge')
        ],
        adminController.dashboard
    )
    
router.route('/update')
    .post([
            celebrate(adminValidation.updateAdmin),
            verifyToken,userPermission('admin')
        ],
        adminController.updateAdmin
    )

router.route('/get/:role')
    .get([
        celebrate(adminValidation.allAdmin),
        verifyToken,userPermission('admin')
        ],
        adminController.allAdmin
    )

router.route('/block/:id/:block')
    .get([
            celebrate(adminValidation.blockAdmin),
            verifyToken,userPermission('admin')
        ],
        adminController.blockAdmin
    )

router.route('/signin')
    .post([
            celebrate(adminValidation.signin)
        ],
        adminController.signin
    )

router.route('/settings')
    .get(adminController.getSettings)
    .post([
            celebrate(adminValidation.postSettings),
            verifyToken,userPermission('admin')
        ],
        adminController.postSettings
    )

router.route('/slider/remove')
    .post([
            celebrate(adminValidation.removeSlider)
        ],
        adminController.removeSlider
    )

router.route('/slider/add')
    .post([
            celebrate(adminValidation.addSlider)
        ],
        adminController.addSlider
    )

router.route('/slider/all')
    .get(adminController.allSliders)


router.route('/password/update')
    .post([
            verifyToken
        ],
        adminController.updatePassword)


router.route('/agent-code/add/:code')
    .get(adminController.addAgentCode)

router.route('/agent-code/remove/:code')
    .get(adminController.removeAgentCode)

router.route('/agent-code')
    .get(adminController.allAgentCode)

router.route('/payment')
    .get(adminController.payment)


router.route('/all/:incharge')
    .get([
            verifyToken,userPermission('admin')
        ],
        adminController.allIncharge
    )

router.route('/approve/payment/:paymentId')
    .get([
            verifyToken,userPermission('admin')
        ],
        adminController.approvePayment
    )

router.route('/agent/bankpayments')
    .get(
        verifyToken,userPermission('admin'),
        adminController.allPayments
    )
    
router.route('/unapproved/bankpayments')
    .get(
        verifyToken,userPermission('admin'),
        adminController.allUnapprovedPayments
    )



module.exports = router;
