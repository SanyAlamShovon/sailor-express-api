const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const signup = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        referral : Joi.string().required(),
        email : Joi.string().email(),
        password : Joi.string().required(),
        address : Joi.string().required(),
        phone : Joi.string().required(),
        otp : Joi.string().required(),
    })
}


const blockUser = {
    params : Joi.object().keys({
        id : Joi.string().required(),
        block : Joi.string().required()
    })
}

const signin = {
    body : Joi.object().keys({
        phone : Joi.string().required(),
        password : Joi.string().required()
    })
}


module.exports = {
    signup,
    blockUser,
    signin
}