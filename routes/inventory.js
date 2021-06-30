const router = require('express').Router();
const { celebrate } = require('celebrate');
const inventoryController = require('./../controllers/inventoryController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const inventoryValidation = require('./../validations/inventoryValidation');

router.route('/add')
    .post([
            celebrate(inventoryValidation.createInventory),
            verifyToken,userPermission('admin','vendor')
        ],
        inventoryController.createInventory
    )

router.route('/vendor/:vendorId')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        inventoryController.allInventoryByVendor
    )

router.route('/delete/:id')
    .get([
            celebrate(inventoryValidation.deleteInventory),
            verifyToken,userPermission('admin','vendor')
        ],
        inventoryController.deleteInventory
    )

module.exports = router;
