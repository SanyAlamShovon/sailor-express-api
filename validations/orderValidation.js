const { Joi } = require('celebrate');
const { link } = require('fs');
Joi.objectId = require('joi-objectid')(Joi);

const createOrder = {
    body : Joi.object().keys({
        _id : Joi.string().allow(null),
        products : Joi.array().items(Joi.object().keys({
            _id : Joi.string().required(),
            size : Joi.string().required(),
            quantity : Joi.number().required(),
            affiliate: Joi.string().allow(null).allow("")
        })),
        discount : Joi.number(),
        promo: Joi.string().allow(null),
        paymentType : Joi.number(),
        deliveryType : Joi.number(),
        isOnline : Joi.boolean(),
        phone : Joi.string(),
        createdBy : Joi.string().required(),
        customer : Joi.object().keys({
            _id : Joi.string(),
            name : Joi.string(),
            address : Joi.string(),
            deliveryAddress : Joi.string()
        })
    })
}

const updateOrder = {
    body : Joi.object().keys({
        products : Joi.array().items(Joi.object().keys({
            _id : Joi.string().required(),
            size : Joi.string().required(),
            quantity : Joi.number().required()
        })),
        customer : Joi.object().keys({
            deliveryAddress : Joi.string()
        })
    })
}



const byId = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

module.exports = {
    createOrder,
    byId,
    updateOrder
}
