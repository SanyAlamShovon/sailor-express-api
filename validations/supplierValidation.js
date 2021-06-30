const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createSupplier = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        phone : Joi.string(),
        address : Joi.string(),
        vendorId : Joi.string().required(),
        images: Joi.array().items(Joi.string()),
        tradeLicense: Joi.object().keys({
            number: Joi.string().allow("").allow(null),
            image: Joi.string().allow("").allow(null)
        }),
        idCard: Joi.object().keys({
            number: Joi.string().allow("").allow(null),
            image: Joi.string().allow("").allow(null)
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string().allow("").allow(null),
            routingNumber: Joi.string().allow("").allow(null),
            detail: Joi.string().allow("").allow(null)
        }),
        contactPerson: Joi.object().keys({
            name: Joi.string().allow("").allow(null),
            phone: Joi.string().allow("").allow(null)
        }),
        mobileBanking: Joi.object().keys({
            number: Joi.string().allow("").allow(null),
            platform: Joi.string().allow("").allow(null)
        })
    })
}

const deleteSupplier = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const updateSupplier = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        phone : Joi.string(),
        address : Joi.string(),
        images: Joi.array().items(Joi.string()),
        tradeLicense: Joi.object().keys({
            number: Joi.string().allow(null),
            image: Joi.string().allow(null)
        }),
        idCard: Joi.object().keys({
            number: Joi.string().allow(null),
            image: Joi.string().allow(null)
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string().allow(null),
            routingNumber: Joi.string().allow(null),
            detail: Joi.string()
        }),
        contactPerson: Joi.object().keys({
            name: Joi.string().allow(null),
            phone: Joi.string().allow(null)
        }),
        mobileBanking: Joi.object().keys({
            number: Joi.string().allow(null),
            platform: Joi.string().allow(null)
        })
    })
}

module.exports = {
    createSupplier,
    deleteSupplier,
    updateSupplier
}
