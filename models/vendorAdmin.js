//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const vendorAdminSchema = new Schema({
    vendorId : {
        type : String,
        trim : true,
        required : true,
        index: true
    },
    vendorName : {
        type : String,
        trim : true,
        required : true
    },
    name : {
        type : String,
        trim : true,
        required : true
    },
    email : {
        type : String,
        trim : true,
        required : true,
        unique : true
    },
    password : {
        type : String,
        trim : true,
        required : true
    },
    isApproved : {
        type : Boolean,
        default : true
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    lastLogin : {
        type : Date
    },
    role : {
        type : String, //vendor
        trim : true,
        required : true,
        default : "vendor"
    }
},{
    timestamps: true
});
const vendorAdmin = Mongoose.model('vendorAdmin',vendorAdminSchema);
module.exports = vendorAdmin;
