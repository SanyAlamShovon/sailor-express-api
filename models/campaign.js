//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const campaignSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    banner: {
        type: String,
        required: true
    },
    fetcherImage: {
        type: String,
        required: true
    },
    products: {
        type: Array,
        required: true
    },
    start_date: {
        type: Date,
        required: true
    },
    end_date: {
        type: Date,
        required: true
    },
    metaTitle: {
        type: String,
        required: true
    },
    metaKeyword: {
        type: String,
        required: true
    },
    metaDescription: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true
    },
    status : {
        type : Boolean,
        default : true
    }
}, {
    timestamps: true
});
const campaign = Mongoose.model('campaign', campaignSchema);
module.exports = campaign;
