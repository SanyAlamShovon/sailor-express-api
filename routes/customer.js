const router = require('express').Router();
const { celebrate } = require('celebrate');
const customerController = require('./../controllers/customerController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const customerValidation = require('./../validations/customerValidation');
const limiter = require('./../config/rateLimit');

router.route('/signup')
    .post([
            celebrate(customerValidation.signup),
        ],
        customerController.signup
    )

router.route('/all')
    .get([
            verifyToken,userPermission('admin')
        ],
        customerController.allCustomer
    )


router.route('/update/:id')
    .post([
            celebrate(customerValidation.update),
        ],
        customerController.update
    )

router.route('/password/forgot/:email')
    .get([
            celebrate(customerValidation.forgotPassword)
        ],
        customerController.forgotPassword
    )

router.route('/password/update/:id')
    .post([
            celebrate(customerValidation.updatePassword)
        ],
        customerController.updatePassword
    )

router.route('/search/:phone')
    .get(customerController.customerByPhone)


router.route('/block/:id/:block')
    .get([
            celebrate(customerValidation.blockCustomer),
            verifyToken,userPermission('admin')
        ],
        customerController.blockCustomer
    )

router.route('/signin')
    .post([
            celebrate(customerValidation.signin)
        ],
        customerController.signin
    )

router.route('/signin/socialmedia')
    .post([
            celebrate(customerValidation.signinWith)
        ],
        customerController.signinWith
    )

module.exports = router;
