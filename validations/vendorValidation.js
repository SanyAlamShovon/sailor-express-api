const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createVendor = {
    body: Joi.object().keys({
        vendorName: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.string(),
        description: Joi.string(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        commission: Joi.number().required(),
        address: Joi.object().keys({
            details: Joi.string().required(),
            district: Joi.string().required()
        }),
        thumbnail: Joi.string().allow(null),
        featured: Joi.boolean().required(),
        permissions: Joi.array().items(Joi.object().keys({
            icon: Joi.string().required(),
            title: Joi.string().required(),
            to: Joi.string().required(),
            flag: Joi.number().required()
        }))
    })
}

const signup = {
    body: Joi.object().keys({
        vendorName: Joi.string().required(),
        name: Joi.string().required(),
        phone: Joi.string(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        address: Joi.object().keys({
            details: Joi.string().required(),
            district: Joi.string().required()
        })
    })
}

const updateVendor = {
    body: Joi.object().keys({
        _id: Joi.string().required(),
        vendorName: Joi.string().required(),
        phone: Joi.string(),
        description: Joi.string(),
        commission: Joi.number().required(),
        address: Joi.object().keys({
            details: Joi.string().required(),
            district: Joi.string().required()
        }),
        thumbnail: Joi.string().allow(null),
        documents: Joi.array().items(Joi.string()),
        featured: Joi.boolean().required(),
        permissions: Joi.array().items(Joi.object().keys({
            icon: Joi.string().required(),
            title: Joi.string().required(),
            to: Joi.string().required(),
            flag: Joi.number().required()
        })),
        tradeLicense: Joi.object().keys({
            number: Joi.string(),
            image: Joi.string().allow("").allow(null)
        }),
        idCard: Joi.object().keys({
            number: Joi.string(),
            image: Joi.string().allow("").allow(null)
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string(),
            routingNumber: Joi.string(),
            detail: Joi.string()
        }),
        contactPerson: Joi.object().keys({
            name: Joi.string(),
            phone: Joi.string()
        }),
        mobileBanking: Joi.object().keys({
            number: Joi.string(),
            platform: Joi.string()
        })
    })
}

const updateVendorProfile = {
    body: Joi.object().keys({
        _id: Joi.string().required(),
        vendorName: Joi.string(),
        phone: Joi.string(),
        description: Joi.string(),
        address: Joi.object().keys({
            details: Joi.string().required(),
            district: Joi.string().required()
        }),
        thumbnail: Joi.string().allow(null),
        documents: Joi.array().items(Joi.string()),
        tradeLicense: Joi.object().keys({
            number: Joi.string(),
            image: Joi.string()
        }),
        idCard: Joi.object().keys({
            number: Joi.string(),
            image: Joi.string()
        }),
        bank: Joi.object().keys({
            accountNumber: Joi.string(),
            routingNumber: Joi.string(),
            detail: Joi.string()
        }),
        contactPerson: Joi.object().keys({
            name: Joi.string(),
            phone: Joi.string()
        }),
        mobileBanking: Joi.object().keys({
            number: Joi.string(),
            platform: Joi.string()
        })
    })
}

const blockVendor = {
    params: Joi.object().keys({
        id: Joi.string().required(),
        block: Joi.string().required()
    })
}

const removeImage = {
    body: Joi.object().keys({
        _id: Joi.string().required(),
        image: Joi.string().required()
    })
}

const approveVendor = {
    params: Joi.object().keys({
        id: Joi.string().required(),
        manager: Joi.string().required()
    })
}

const signin = {
    body: Joi.object().keys({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    })
}

const createVendorAdmin = {
    body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        role: Joi.string()
    })
}

const removeVendorAdmin = {
    params: Joi.object().keys({
        id: Joi.string().required()
    })
}

const addImage = {
    body: Joi.object().keys({
        _id: Joi.string().required(),
        image: Joi.string().required()
    })
}

module.exports = {
    createVendor,
    signup,
    blockVendor,
    signin,
    approveVendor,
    createVendorAdmin,
    removeVendorAdmin,
    updateVendor,
    removeImage,
    addImage,
    updateVendorProfile
}
