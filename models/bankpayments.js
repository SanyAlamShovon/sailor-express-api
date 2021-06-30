//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const bankPaymentSchema = new Schema({
    agentId : {
        type : String,
        trim : true,
        required : true,
    },
    orderId : {
        type : String,
        trim : true,
    },
    amount : {
        type : Number
    },
    bank : {
        type : String
    },
    type : {
        type : String,
        required : true
    },
    status : {
        type : Number,
        required : true,
        default : 0,
    },
    attachment : {
        type : String,
        trim : true,
        required : true,
    }
},{
    timestamps: true
});
const bankInfo = Mongoose.model('bankpayment',bankPaymentSchema);
module.exports = bankInfo;
