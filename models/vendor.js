//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const vendorSchema = new Schema({
    vendorName : {
        type : String,
        trim : true,
        required : true,
        unique : true,
        index: true
    },
    commission : {
        type : Number //percentage
    },
    address : {
        details : {
            type : String,
            required : true
        },
        district : {
            type : String,
            required : true
        }
    },
    thumbnail : {
        type : String
    },
    image_large: String,
    images : [{
        type : String
    }],
    documents : [{
        type : String
    }],
    isApproved : {
        type : Boolean,
        default : false
    },
    balance : {
        type : Number,
        default : 0
    },
    phone : {
        type : String,
        trim : true
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    sizes : [{
        type : String
    }],
    permissions : [{
        icon: {
            type : String
        },
        title : {
            type : String
        },
        to : {
            type : String
        },
        flag : {
            type : Number
        }
    },{ _id : false }],
    description : {
      type : String
    },
    featured : {
      type : Boolean,
      default : false
    },
    tradeLicense : {
        number : String,
        image : String
    },
    idCard : { //passport or NID
        number : String,
        image : String
    },
    bank : {
        accountNumber : String,
        routingNumber : String,
        detail : String
    },
    contactPerson : {
        name : String,
        phone : String
    },
    mobileBanking : {
        number : String,
        platform : String //bkash, ucash, rocket, nagad
    },
    manager : {
        _id : String,
        name : String,
        phone : String,
        email : String
    }
},{
    timestamps: true
});
const vendor = Mongoose.model('vendor',vendorSchema);
module.exports = vendor;
