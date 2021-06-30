const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createSubsubCategory = {
    body : Joi.object().keys({
        subcategoryId : Joi.string().required(),
        name : Joi.string().required(),
        image : Joi.string().required()
    })
}

const deleteSubsubCategory = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const updateSubsubCategory = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        image : Joi.string().allow(null)
    })
}

module.exports = {
    createSubsubCategory,
    deleteSubsubCategory,
    updateSubsubCategory
}
