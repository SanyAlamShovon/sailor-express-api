const router = require('express').Router();
const { celebrate } = require('celebrate');
const subCategoryController = require('./../controllers/subCategoryController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const subCategoryValidation = require('./../validations/subCategoryValidation');

router.route('/create')
    .post([
            celebrate(subCategoryValidation.createSubCategory),
            verifyToken,userPermission('admin')
        ],
        subCategoryController.createSubCategory
    )

router.route('/update')
    .post([
            celebrate(subCategoryValidation.updateSubCategory),
            verifyToken,userPermission('admin')
        ],
        subCategoryController.updateSubCategory
    )

router.route('/all')
    .get(subCategoryController.allSubCategory)

router.route('/delete/:id')
    .get([
            celebrate(subCategoryValidation.deleteSubCategory),
            verifyToken,userPermission('admin')
        ],
        subCategoryController.deleteSubCategory
    )

module.exports = router;
