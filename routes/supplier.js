const router = require('express').Router();
const { celebrate } = require('celebrate');
const supplierController = require('./../controllers/supplierController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const supplierValidation = require('./../validations/supplierValidation');

router.route('/create')
    .post([
            celebrate(supplierValidation.createSupplier),
            verifyToken,userPermission('admin','vendor')
        ],
        supplierController.createSupplier
    )

router.route('/update')
    .post([
            celebrate(supplierValidation.updateSupplier),
            verifyToken,userPermission('admin','vendor')
        ],
        supplierController.updateSupplier
    )

router.route('/all/:vendorId')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        supplierController.allSupplier
    )

router.route('/delete/:id')
    .get([
            celebrate(supplierValidation.deleteSupplier),
            verifyToken,userPermission('admin','vendor')
        ],
        supplierController.deleteSupplier
    )


router.route('/:supplierId/pay/:amount/:paymentMethod')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        supplierController.pay
    )

module.exports = router;
