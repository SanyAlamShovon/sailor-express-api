const router = require('express').Router();
const salesController = require('./../controllers/salesController');
const reportController = require('./../controllers/reportController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');

router.route('/sales/all')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        salesController.allSales
    )

router.route('/sales/download')
    .post([
            verifyToken,userPermission('admin','vendor')
        ],
        salesController.allSalesDownload
    )

router.route('/purchase/all')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        salesController.allPurchase
    )


router.route('/purchase/download')
    .post([
            verifyToken,userPermission('admin','vendor')
        ],
        salesController.allPurchaseDownload
    )

router.route('/chart')
    .get([
            verifyToken,userPermission('admin','vendor','incharge')
        ],
        salesController.salesChart
    )

router.route('/agent/:id')
    .get([
            verifyToken,userPermission('admin','agent','incharge')
        ],
        reportController.agentReport
    )

router.route('/incharge/:id')
    .get([
            verifyToken,userPermission('admin','incharge')
        ],
        reportController.inchargeReport
    )

router.route('/area/incharge/:id')
    .get([
            verifyToken,userPermission('admin','incharge')
        ],
        reportController.getDisIncharge
    )
    
module.exports = router;
