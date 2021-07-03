const { Joi } = require('celebrate');
Joi.objectId = require('joi-objectid')(Joi);

const createCampaign = {
    body : Joi.object().keys({
        title : Joi.string().required(),
        banner : Joi.string().required(),
        products : Joi.array().required(),
        campaignFor : Joi.string().required(),
        start_date : Joi.date().required(),
        end_date: Joi.date().required(),
        metaTitle: Joi.string().required(),
        metaKeyword: Joi.string().required(),
        metaDescription: Joi.string().required(),
        slug: Joi.string().required()
    })
}

const updateCampaign = {
    body : Joi.object().keys({
        _id : Joi.string().required(),
        title : Joi.string().required(),
        products : Joi.array().required(),
        campaignFor : Joi.string().required(),
        start_date : Joi.date().required(),
        end_date: Joi.date().required(),
        metaTitle: Joi.string().required(),
        metaKeyword: Joi.string().required(),
        metaDescription: Joi.string().required(),
        slug: Joi.string().required(),
        banner : Joi.string().allow(null),
    })
}

const bySlug = {
    params : Joi.object().keys({
        slug : Joi.string().required()
    })
}

const deleteCampaign = {
    params : Joi.object().keys({
        id : Joi.string().required()
    })
}

const allCampaign = {
    params : Joi.object().keys({
        campaignFor : Joi.string().required()
    })
}


module.exports = {
    createCampaign,
    bySlug,
    deleteCampaign,
    updateCampaign,
    allCampaign
}
