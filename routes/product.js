const router = require('express').Router();
const { celebrate } = require('celebrate');
const productController = require('./../controllers/productController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const productValidation = require('./../validations/productValidation');

router.route('/create')
    .post([
            celebrate(productValidation.createProduct),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.createProduct
    )

router.route('/update')
    .post([
            celebrate(productValidation.updateProduct),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.updateProduct
    )
router.route('/update/discount')
    .post([
            celebrate(productValidation.updateDiscount),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.updateDiscount
    )

router.route('/all/:page')
    .get([
            verifyToken,userPermission('admin')
        ],
        productController.allProduct
    )

router.route('/preset')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        productController.productPreset
    )


router.route('/unapproved')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        productController.unapprovedPorducts
    )

router.route('/approve/:id')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        productController.approveProduct
    )

router.route('/vendor/:vendorId')
    .get([
            celebrate(productValidation.allProductByVendor),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.allProductByVendor
    )

router.route('/foragent')
    .get([
            verifyToken,userPermission('admin','agent')
        ],
        productController.allProductForAgent
    )

router.route('/shop/:vendorId')
    .get([
            celebrate(productValidation.allProductByVendor),
        ],
        productController.productByVendor
    )

router.route('/delete/:id')
    .get([
            celebrate(productValidation.byId),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.deleteProduct
    )


router.route('/image/add')
    .post([
            celebrate(productValidation.addImage),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.addImage
    )


router.route('/image/remove')
    .post([
            celebrate(productValidation.removeImage),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.removeImage
    )

router.route('/update/:id')
    .post([
            celebrate(productValidation.updateProduct),
            verifyToken,userPermission('admin','vendor')
        ],
        productController.updateProduct
    )

router.route('/view/:id')
    .get([
            celebrate(productValidation.byId),
        ],
        productController.viewProduct
    )

router.route('/slug/view/:slug')
    .get([
            celebrate(productValidation.bySlug),
        ],
        productController.viewProductSlug
    )

router.route('/search/:char')
    .get(productController.search)

router.route('/find/:char')
    .post(productController.findProducts)

router.route('/search/sku/:sku')
    .get(productController.productBySKU)

router.route('/category/:id')
    .get(productController.productByCategory)

router.route('/subcategory/:id')
    .get(productController.productBySubcategory)


router.route('/subsubcategory/:id')
    .get(productController.productBySubsubcategory)

router.route('/brand/:id')
    .get(productController.productByBrand)

router.route('/image')
    .post(productController.allImage)

router.route('/bulk-discount/create')
    .post([
            celebrate(productValidation.bulkDiscount),
            verifyToken,userPermission('admin')
        ],
        productController.bulkDiscount
    )

router.route('/bulk-discount')
    .get([
            verifyToken,userPermission('admin')
        ],
        productController.allBulkDiscount
    )


router.route('/bulk-discount/remove/:id')
    .get([
            verifyToken,userPermission('admin')
        ],
        productController.removeBulkDiscount
    )

module.exports = router;
