const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createSubCategory = {
    body : Joi.object().keys({
        categoryId : Joi.string().required(),
        name : Joi.string().required(),
        image : Joi.string().required(),
        active: Joi.boolean()
    })
}

const deleteSubCategory = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const updateSubCategory = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        image : Joi.string().allow(null),
        active: Joi.boolean()
    })
}

module.exports = {
    createSubCategory,
    deleteSubCategory,
    updateSubCategory
}
