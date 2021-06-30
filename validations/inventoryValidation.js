const { Joi } = require('celebrate');
const { link } = require('fs');
Joi.objectId = require('joi-objectid')(Joi);

const createInventory = {
    body : Joi.object().keys({
        productId : Joi.string().required(),
        supplierId : Joi.string().allow(null),
        vendorId : Joi.string().required(),
        buyingPrice : Joi.number().allow(null),
        paid : Joi.number().allow(null),
        due : Joi.number().allow(null),
        size : Joi.string().allow(null),
        stock : Joi.number().required(),
        invoiceNo : Joi.string().allow(null),
        gatePassNo : Joi.string().allow(null),
        sellingPrice : Joi.number().required(),
        expireDate : Joi.string().allow(null),
        image : Joi.string().allow(null)
    })
}

const deleteInventory = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

module.exports = {
    createInventory,
    deleteInventory
}
