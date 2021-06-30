//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const adminsSchema = new Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },
    email : {
        type : String,
        trim : true,
        required : true,
        unique : true,
        index : true
    },
    password : {
        type : String,
        required : true,
        min : [6, 'To Short Password'],
        trim : true
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
    address : String,
    joiningDate : Date,
    phone : {
        type: String,
        required: true
    },
    lastLogin : {
        type: Date
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    balance: {
        type: Number,
        default: 0
    },
    role : {
        type : String,
        required : true,
        default : "admin"
    },
    incharge: {
        type: String,
    },
    area: {
        type: String,
    },
    uniqueId : {
        type: String,
        required : true,
        trim : true
    },
    superAdmin : {
        type: Boolean,
        default: false
    },
    log : {
        createdBy : String,
        updatedBy : String,
        updatedDate : Date,
        deletedBy : String,
        deletedDate : Date
    },
    permissions : [{
        icon: {
            type : String,
            required : true
        },
        title : {
            type : String,
            required : true
        },
        to : {
            type : String,
            required : true
        },
        flag : {
            type : Number,
            required : true
        }
    },{ _id : false }]
},{
    timestamps: true
});
const admins = Mongoose.model('admins',adminsSchema);
module.exports = admins;
