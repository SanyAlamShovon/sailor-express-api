const router = require('express').Router();
const { celebrate } = require('celebrate');
const subsubCategoryController = require('../controllers/subsubCategoryController');
const verifyToken = require('../middleware/verifyToken');
const userPermission = require('../middleware/permission');
const subsubCategoryValidation = require('../validations/subsubCategoryValidation');

router.route('/create')
    .post([
            celebrate(subsubCategoryValidation.createSubsubCategory),
            verifyToken,userPermission('admin')
        ],
        subsubCategoryController.createSubsubCategory
    )

router.route('/update')
    .post([
            celebrate(subsubCategoryValidation.updateSubsubCategory),
            verifyToken,userPermission('admin')
        ],
        subsubCategoryController.updateSubsubCategory
    )

router.route('/all')
    .get(subsubCategoryController.allSubsubCategory)

router.route('/delete/:id')
    .get([
            celebrate(subsubCategoryValidation.deleteSubsubCategory),
            verifyToken,userPermission('admin')
        ],
        subsubCategoryController.deleteSubsubCategory
    )

module.exports = router;
