const router = require('express').Router();
const { celebrate } = require('celebrate');
const campaignController = require('../controllers/campaignController');
const verifyToken = require('../middleware/verifyToken');
const userPermission = require('../middleware/permission');
const campaignValidation = require('../validations/campaignValidation');

router.route('/create')
    .post([
            celebrate(campaignValidation.createCampaign),
            verifyToken,userPermission('admin')
        ],
        campaignController.createCampaign
    )

router.route('/get/campaigns')
    .get(
            verifyToken,userPermission('admin','agent'),
            campaignController.allCampaign
        )

router.route('/slug/view/:slug')
    .get([
            celebrate(campaignValidation.bySlug),
        ],
        campaignController.viewCampaigntSlug
    )

router.route('/delete/:id')
    .get([
            celebrate(campaignValidation.deleteCampaign),
            verifyToken,userPermission('admin')
        ],
        campaignController.deleteCampaign
    )
// router.route('/update/:id')
//     .post([
//             celebrate(productValidation.updateProduct),
//             verifyToken,userPermission('admin','vendor')
//         ],
//         productController.updateProduct
//     )

module.exports = router;
