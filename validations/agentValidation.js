const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const signup = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        email : Joi.string().email(),
        password : Joi.string().required(),
        address : Joi.string().required(),
        division : Joi.string().required(),
        upazila : Joi.string().required(),
        district : Joi.string().required(),
        phone : Joi.string().required()
    })
}

const blockAgent = {
    params : Joi.object().keys({
        id : Joi.string().required(),
        block : Joi.string().required()
    })
}

const idAgent = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const signin = {
    body : Joi.object().keys({
        phone : Joi.string().required(),
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
        _id : Joi.string().required(),
        name : Joi.string().required(),
        division_incharge: Joi.string().required(),
        district_incharge: Joi.string().required(),
        email : Joi.string().required(),
        address : Joi.string().required(),
        phone : Joi.string().required(),
        district : Joi.string().allow(null).allow(''),
        deliveryAddress: Joi.string().required()
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

const bankInfo = {
    body : Joi.object().keys({
        agentId : Joi.string().required(),
        orderId : Joi.string().allow(null),
        amount : Joi.number().required(),
        bank : Joi.string().required(),
        type : Joi.string().required(),
        accountNumber : Joi.string().required(),
        attachment : Joi.string().required()
    })
}

const paymentInfo = {
    body : Joi.object().keys({
        agentId : Joi.string().required(),
        amount : Joi.number().required(),
        bank : Joi.string().required(),
        accountNumber : Joi.string().required(),
        attachment : Joi.string().required()
    })
}

const smsSend = {
    body : Joi.object().keys({
        phone : Joi.string().required(),
        content : Joi.string().required()
    })
}

module.exports = {
    signup,
    blockAgent,
    update,
    forgotPassword,
    updatePassword,
    signin,
    signinWith,
    bankInfo,
    paymentInfo,
    idAgent,
    smsSend
}
