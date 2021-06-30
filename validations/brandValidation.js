const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createBrand = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        description : Joi.string().allow(null),
        image : Joi.string().required(),
        active: Joi.boolean()
    })
}

const deleteBrand = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const updateBrand = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        description : Joi.string().allow(null),
        image : Joi.string().allow(null),
        active: Joi.boolean()
    })
}

module.exports = {
    createBrand,
    deleteBrand,
    updateBrand
}
