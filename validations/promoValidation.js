const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const create = {
    body : Joi.object().keys({
        code : Joi.string().required(),
        discount : Joi.number().required(),
        validity : Joi.date().required()
    })
}

const byCode = {
    params : Joi.object().keys({
        code : Joi.string().required()
    })
}


module.exports = {
    create,
    byCode
}
