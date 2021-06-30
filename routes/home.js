const router = require('express').Router();
const homeController = require('./../controllers/homeController');
const verifyToken = require('./../middleware/verifyToken');


router.route('/')
    .get(homeController.home)


module.exports = router;
