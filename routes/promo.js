const router = require('express').Router();
const { celebrate } = require('celebrate');
const promoController = require('./../controllers/promoController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const promoValidation = require('./../validations/promoValidation');

router.route('/create')
    .post([
            celebrate(promoValidation.create),
            verifyToken,userPermission('admin')
        ],
        promoController.create
    )

router.route('/all')
    .get(promoController.allPromo)

router.route('/delete/:code')
    .get([
            celebrate(promoValidation.byCode),
            verifyToken,userPermission('admin')
        ],
        promoController.remove
    )

router.route('/verify/:code')
    .get([
            celebrate(promoValidation.byCode)
        ],
        promoController.verify
    )

module.exports = router;
