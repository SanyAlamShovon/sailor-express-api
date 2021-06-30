const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createAdmin = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        email : Joi.string().email().required(),
        password : Joi.string().required(),
        role : Joi.string(),
        incharge : Joi.string().allow(null),
        area: Joi.string().allow(null),
        permissions : Joi.array().items(Joi.object().keys({
            icon : Joi.string().required(),
            title : Joi.string().required(),
            to : Joi.string().required(),
            flag : Joi.number().required()
        })),
        idCard: Joi.object().keys({
            number: Joi.string(),
            image: Joi.string().allow("").allow(null)
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string(),
            routingNumber: Joi.string(),
            detail: Joi.string()
        }),
        address : Joi.string(),
        phone : Joi.string().required(),
        joiningDate : Joi.date()
    })
}

const updateAdmin = {
    body : Joi.object().keys({
        _id : Joi.objectId().required(),
        name : Joi.string().required(),
        email : Joi.string().email().required(),
        password : Joi.string(),
        role : Joi.string(),
        incharge : Joi.string().allow(null),
        area: Joi.string().allow(null),
        permissions : Joi.array().items(Joi.object().keys({
            _id: Joi.string().allow(null),
            icon : Joi.string().required(),
            title : Joi.string().required(),
            to : Joi.string().required(),
            flag : Joi.number().required()
        })),
        idCard: Joi.object().keys({
            number: Joi.string().allow("").allow(null),
            image: Joi.string().allow("").allow(null)
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string().allow("").allow(null),
            routingNumber: Joi.string().allow("").allow(null),
            detail: Joi.string()
        }),
        address : Joi.string().allow("").allow(null),
        phone : Joi.string().required().allow("").allow(null),
        joiningDate : Joi.date().allow("").allow(null)
    })
}

const blockAdmin = {
    params : Joi.object().keys({
        id : Joi.string().required(),
        block : Joi.string().required()
    })
}

const signin = {
    body : Joi.object().keys({
        email : Joi.string().email().required(),
        password : Joi.string().required()
    })
}

const postSettings = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        email : Joi.string().required(),
        phone : Joi.string().required(),
        tagLine : Joi.string().required(),
        badge: Joi.boolean(),
        sliders : Joi.array().items(Joi.object().keys({
            _id : Joi.string(),
            image: Joi.string(),
            redirectUrl: Joi.string()
        })),
        whyUs : Joi.string().required(),
        aboutUs : Joi.string().required(),
        address : Joi.string().required(),
        facebook : Joi.string().required(),
        instagram : Joi.string().required(),
        logo : Joi.string().allow(null),
        invoiceLogo : Joi.string().allow(null)
    })
}

const removeSlider = {
    body : Joi.object().keys({
        slider : Joi.string().required()
    })
}

const addSlider = {
    body : Joi.object().keys({
        slider : Joi.string().required(),
        redirectUrl : Joi.string().allow('null')
    })
}


module.exports = {
    createAdmin,
    blockAdmin,
    signin,
    postSettings,
    removeSlider,
    updateAdmin,
    addSlider
}
