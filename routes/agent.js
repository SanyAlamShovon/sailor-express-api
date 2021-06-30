const router = require('express').Router();
const { celebrate } = require('celebrate');
const agentController = require('./../controllers/agentController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const agentValidation = require('./../validations/agentValidation');
const limiter = require('./../config/rateLimit');

router.route('/signup')
    .post([
            celebrate(agentValidation.signup),
        ],
        agentController.signup
    )

router.route('/all')
    .get([
            verifyToken,userPermission('admin')
        ],
        agentController.allAgent
    )

router.route('/profile/:id')
    .get([
            verifyToken,userPermission('admin','agent')
        ],
        agentController.agentProfile
    )


router.route('/update')
    .post([
            verifyToken,
            celebrate(agentValidation.update),
        ],
        agentController.update
    )

router.route('/password/forgot/:email')
    .get([
            celebrate(agentValidation.forgotPassword)
        ],
        agentController.forgotPassword
    )

router.route('/password/update/:id')
    .post([
            celebrate(agentValidation.updatePassword)
        ],
        agentController.updatePassword
    )


router.route('/block/:id/:block')
    .get([
            celebrate(agentValidation.blockAgent),
            verifyToken,userPermission('admin')
        ],
        agentController.blockAgent
    )

router.route('/signin')
    .post([
            celebrate(agentValidation.signin)
        ],
        agentController.signin
    )

router.route('/pay')
    .post(agentController.pay)

router.route('/send/sms')
    .post([
        celebrate(agentValidation.smsSend),
        verifyToken,userPermission('agent')
    ],
        agentController.sendSms
    )

router.route('/bank/payment')
    .post([
            celebrate(agentValidation.bankInfo),
            verifyToken,userPermission('agent')
        ],
        agentController.bankPayment
    )
    

router.route('/bankpayments/:id')
    .get(
        [
            celebrate(agentValidation.idAgent),
            verifyToken,userPermission('agent')
        ],
        agentController.agentBankPayments
    )


router.route('/recharge/balance')
    .post([
            celebrate(agentValidation.paymentInfo),
            verifyToken,userPermission('agent')
        ],
        agentController.balanceRecharge
    )

router.route('/payment')
    .post(agentController.payment)

router.route('/emi')
    .post(agentController.emi)


router.route('/payment/:id')
    .post(agentController.ipn)

module.exports = router;
