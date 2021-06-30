const router = require('express').Router();
const { celebrate } = require('celebrate');
const vendorController = require('./../controllers/vendorController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const vendorValidation = require('./../validations/vendorValidation');

router.route('/create')
    .post([
        celebrate(vendorValidation.createVendor),
        verifyToken, userPermission('admin')
    ],
        vendorController.createVendor
    )

router.route('/all')
    .get([
        verifyToken, userPermission('admin')
    ],vendorController.allVendor)

router.route('/')
    .get(vendorController.allShops)


router.route('/signup')
    .post([
        celebrate(vendorValidation.signup)
    ],
        vendorController.signup
    )

router.route('/update')
    .post([
        celebrate(vendorValidation.updateVendor),
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.updateVendor
    )

router.route('/image/add')
    .post([
        celebrate(vendorValidation.addImage),
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.addImage
    )

router.route('/profile/:id')
    .get([
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.getProfile
    )
router.route('/profile/update')
    .post([
        celebrate(vendorValidation.updateVendorProfile)
    ],
        vendorController.updateVendorProfile
    )

router.route('/image/remove')
    .post([
        celebrate(vendorValidation.removeImage),
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.removeImage
    )

router.route('/image')
    .post([
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.allImage
    )

router.route('/approve/:id/:manager')
    .get([
        celebrate(vendorValidation.approveVendor),
        verifyToken, userPermission('admin')
    ],
        vendorController.approveVendor
    )

router.route('/block/:id/:block')
    .get([
        celebrate(vendorValidation.blockVendor),
        verifyToken, userPermission('admin')
    ],
        vendorController.blockVendor
    )

router.route('/signin')
    .post([
        celebrate(vendorValidation.signin)
    ],
        vendorController.signin
    )

router.route('/user/create')
    .post([
        celebrate(vendorValidation.createVendorAdmin),
        verifyToken, userPermission('vendor')
    ],
        vendorController.createVendorAdmin
    )

router.route('/user/all/:vendorId')
    .get([
        verifyToken, userPermission('vendor')
    ],
        vendorController.allVendorAdmin
    )

router.route('/user/remove/:id')
    .get([
        celebrate(vendorValidation.removeVendorAdmin),
        verifyToken, userPermission('vendor')
    ],
        vendorController.removeVendorAdmin
    )


router.route('/:vendorId/size')
    .get([
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.getAllSizes
    )
    .post([
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.saveSize
    )

router.route('/:vendorId/size/remove')
    .post([
        verifyToken, userPermission('admin', 'vendor')
    ],
        vendorController.removeSize
    )

router.route('/:vendorId/pay/:amount/:paymentMethod')
    .get([
        verifyToken, userPermission('admin')
    ],
        vendorController.pay
    )

module.exports = router;
