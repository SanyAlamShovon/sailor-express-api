const router = require('express').Router();
const { celebrate } = require('celebrate');
const brandController = require('./../controllers/brandController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const brandValidation = require('./../validations/brandValidation');

router.route('/create')
    .post([
            celebrate(brandValidation.createBrand),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        brandController.createBrand
    )

router.route('/update')
    .post([
            // celebrate(brandValidation.updateBrand),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        brandController.updateBrand
    )

router.route('/all')
    .get(brandController.allBrand)

router.route('/delete/:id')
    .get([
            celebrate(brandValidation.deleteBrand),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        brandController.deleteBrand
    )

module.exports = router;
