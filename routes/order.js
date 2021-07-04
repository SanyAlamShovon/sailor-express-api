const router = require('express').Router();
const { celebrate } = require('celebrate');
const orderController = require('./../controllers/orderController');
const verifyToken = require('./../middleware/verifyToken');
const userPermission = require('./../middleware/permission');
const orderValidation = require('./../validations/orderValidation');

router.route('/create') //by customer
    .post([
            verifyToken,userPermission('agent','customer'),
            celebrate(orderValidation.createOrder)
        ],
        orderController.createOrder
    )

router.route('/update/:id')
    .post([
            verifyToken,userPermission('admin','vendor'),
            celebrate(orderValidation.createOrder)
        ],
        orderController.updateOrder
    )
    
router.route('/create/offline')
    .post([
            verifyToken,userPermission('admin','vendor'),
            celebrate(orderValidation.createOrder)
        ],
        orderController.createOfflineOrder
    )

router.route('/view/byDate')
    .post([
            verifyToken,userPermission('admin')
        ],
        orderController.ordersByDate
    )

router.route('/view')
    .post([
            verifyToken,userPermission('admin')
        ],
        orderController.allOrders
    )

router.route('/pay/:id')
    .get(orderController.pay)

router.route('/status/:orderId')
    .get([
            verifyToken,userPermission('admin')
        ],
        orderController.orderStatus
    )

router.route('/view/admin')
    .post([
            verifyToken,userPermission('admin')
        ],
        orderController.allOrdersByAdmin
    )

router.route('/view/vendor/:vendorId')
    .get([
            verifyToken,userPermission('admin','vendor')
        ],
        orderController.allOrdersByVendor
    )

router.route('/view/customer/:customerId')
    .get([
            verifyToken,userPermission('agent')
        ],
        orderController.allOrdersByCustomer
    )

router.route('/delete/:id')
    .get([
            celebrate(orderValidation.byId),
            verifyToken,userPermission('admin')
        ],
        orderController.deleteOrder
    )


router.route('/update/:id/state/:val')
    .get([
            verifyToken,userPermission('admin')
        ],
        orderController.updateOrderState
    )

router.route('/update/:id/payment/:val')
    .get([
            verifyToken,userPermission('admin')
        ],
        orderController.updatePaymentStatus
    )

module.exports = router;
