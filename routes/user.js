const router = require('express').Router();
const { celebrate } = require('celebrate');
const userController = require('./../controllers/userController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const userValidation = require('./../validations/userValidation');
const limiter = require('./../config/rateLimit');



router.route('/signup')
    .post([
            celebrate(userValidation.signup),
        ],
        userController.signup
    )

router.route('/send/otp/:phone')
    .get([
            celebrate(userValidation.phone),
        ],
        userController.sendOTP
    )

router.route('/verify/:phone/:otp')
    .get([
            celebrate(userValidation.auth),
        ],
        userController.authenticateOTP
    )

router.route('/signup')
    .post([
            celebrate(userValidation.signup),
        ],
        userController.signup
    )




module.exports = router;
