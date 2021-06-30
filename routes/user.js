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

module.exports = router;
