//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const settingSchema = new Schema({
    name : {
        type : String,
        trim : true,
        required : true
    },
    email : {
        type : String,
        required : true
    },
    phone : {
        type : String,
        trim : true,
        required : true
    },
    aboutUs : {
        type : String,
        required : true
    },
    address : {
        type : String,
        trim : true,
        required : true
    },
    facebook : {
        type : String,
        required : true
    },
    instagram : {
        type : String,
        required : true
    },
    logo : {
        type : String
    },
    invoiceLogo : {
        type : String
    },
    badge : {
        type: Boolean,
        default: true
    },
    agentCode : [String],
    sliders : [{
        image : {
            type : String,
            required : true
        },
        redirectUrl : {
            type : String
        }
    }]
},{
    timestamps: true
});
const setting = Mongoose.model('setting',settingSchema);
module.exports = setting;
