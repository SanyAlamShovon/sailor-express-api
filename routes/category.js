const router = require('express').Router();
const { celebrate } = require('celebrate');
const categoryController = require('./../controllers/categoryController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const categoryValidation = require('./../validations/categoryValidation');

router.route('/create')
    .post([
            celebrate(categoryValidation.createCategory),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        categoryController.createCategory
    )

router.route('/update')
    .post([
            // celebrate(categoryValidation.updateCategory),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        categoryController.updateCategory
    )

router.route('/all')
    .get(categoryController.allCategory)

router.route('/delete/:id')
    .get([
            celebrate(categoryValidation.deleteCategory),
            verifyToken,userPermission('admin','inventory-admin')
        ],
        categoryController.deleteCategory
    )

module.exports = router;
