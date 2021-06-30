const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createCategory = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        image : Joi.string().required(),
        featured : Joi.boolean().allow(null),
        active: Joi.boolean()
    })
}

const deleteCategory = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const updateCategory = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        image : Joi.string().allow(null),
        featured : Joi.boolean().allow(null),
        active: Joi.boolean()
    })
}

module.exports = {
    createCategory,
    deleteCategory,
    updateCategory
}
