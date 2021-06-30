const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const signup = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        email : Joi.string().email().required(),
        password : Joi.string().required(),
        address : Joi.string().required(),
        phone : Joi.string().required()
    })
}

const blockCustomer = {
    params : Joi.object().keys({
        id : Joi.string().required(),
        block : Joi.string().required()
    })
}

const signin = {
    body : Joi.object().keys({
        email : Joi.string().required(),
        password : Joi.string().required()
    })
}

const signinWith = {
    body : Joi.object().keys({
        email : Joi.string().email().required()
    })
}

const update = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        email : Joi.string().required(),
        address : Joi.string().required(),
        phone : Joi.string().required()
    })
}

const forgotPassword = {
    params : Joi.object().keys({
        email : Joi.string().required()
    })
}

const updatePassword = {
    body : Joi.object().keys({
        oldPassword : Joi.string().required(),
        newPassword : Joi.string().required()
    })
}

module.exports = {
    signup,
    blockCustomer,
    update,
    forgotPassword,
    updatePassword,
    signin,
    signinWith
}
