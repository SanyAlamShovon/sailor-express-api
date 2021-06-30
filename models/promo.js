//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const promoSchema = new Schema({
    code : {
        type : String,
        trim : true,
        required : true
    },
    discount : {
        type : Number,
        required : true
    },
    validity : {
        type : Date,
        required : true
    }
},{
    timestamps: true
});
const promo = Mongoose.model('promo',promoSchema);
module.exports = promo;
