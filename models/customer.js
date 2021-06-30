//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const customersSchema = new Schema({
    name : {
        type : String,
        trim : true
    },
    username: {
        type : String,
        trim : true
    },
    phone : {
        type : String,
        trim : true,
        index: true,
        required : true,
        unique : true
    },
    email : {
        type : String,
        trim : true
    },
    address : {
        type : String,
        default : ''
    },
    deliveryAddress : {
        type : String,
        default : ''
    },
    password : {
        type : String,
        trim : true
    },
    lastLogin : {
        type: Date
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    role : {
        type : String,
        default : "customer" 
    },
    log : {
        createdBy : String,
        updatedBy : String,
        updatedDate : Date,
        deletedBy : String,
        deletedDate : Date
    }
},{
    timestamps: true
});
const customers = Mongoose.model('customers',customersSchema);
module.exports = customers;
