//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const brandSchema = new Schema({
    name: {
        type: String,
        index: true,
        trim: true,
        required: true
    },
    slug: {
        type: String,
        index: true,
        trim: true,
        unique: true,
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    description: {
        type: String
    },
    image: String,
    image_large: String
}, {
    timestamps: true
});
const brand = Mongoose.model('brand', brandSchema);
module.exports = brand;
