const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createProduct = {
    body : Joi.object().keys({
        name : Joi.string().required(),
        description : Joi.string().allow(null),
        brand : Joi.string().allow(null),
        vendorId : Joi.string().required(),
        category : Joi.string().required(),
        subcategory: Joi.string().required(),
        subsubcategory: Joi.string().allow(null),
        vat: Joi.number().allow(null),
        forOnline : Joi.boolean().required(),
        price : Joi.number().allow(null),
        forAgent : Joi.boolean().allow(null),
        forCampaign : Joi.boolean().allow(null),
        thumbnail : Joi.string().required(),
        topSelling : Joi.boolean().required(),
        newArrival : Joi.boolean().allow(null),
        featured : Joi.boolean().required(),
        freeDelivery: Joi.boolean(),
        discount : Joi.object().keys({
            type : Joi.number().allow(null),
            amount : Joi.number().allow(null)
        })
    })
}

const byId = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const bySlug = {
    params : Joi.object().keys({
        slug : Joi.string().required()
    })
}


const updateProduct = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        name : Joi.string().required(),
        description : Joi.string().allow(null),
        brand : Joi.string(),
        vendorId : Joi.string().required(),
        category : Joi.string().required(),
        subcategory: Joi.string().required(),
        subsubcategory: Joi.string().allow(null),
        vat: Joi.number().required(),
        forOnline : Joi.boolean().required(),
        price : Joi.number().allow(null),
        forAgent : Joi.boolean().allow(null),
        forCampaign : Joi.boolean().allow(null),
        thumbnail : Joi.string().allow(null),
        topSelling : Joi.boolean().required(),
        freeDelivery: Joi.boolean(),
        newArrival : Joi.boolean().allow(null),
        featured : Joi.boolean().required(),
        discount : Joi.object().keys({
            type : Joi.number().allow(null),
            amount : Joi.number().allow(null)
        })
    })
}

const addImage = {
    body : Joi.object().keys({
      _id : Joi.string().required(),
      image : Joi.string().required()
    })
}

const removeImage = {
    body : Joi.object().keys({
      _id : Joi.string().required(),
      image : Joi.string().required()
    })
}

const allProductByVendor = {
    params : Joi.object().keys({
        vendorId : Joi.string().required()
    })
}

const updateDiscount = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        discount : Joi.object().keys({
            type : Joi.number().required(),
            amount : Joi.number().required()
        })
    })
}

const bulkDiscount = {
    body : Joi.object().keys({
        method : Joi.string().required(),
        id : Joi.string().required(),
        discount : Joi.object().keys({
            type : Joi.number().required(),
            amount : Joi.number().required()
        })
    })
}


module.exports = {
    createProduct,
    byId,
    bySlug,
    updateProduct,
    addImage,
    removeImage,
    allProductByVendor,
    updateDiscount,
    bulkDiscount
}
