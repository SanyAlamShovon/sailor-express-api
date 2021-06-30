//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const agentsSchema = new Schema({
    name: {
        type: String,
        trim: true
    },
    agentId:{
        type: String,
        trim: true
    },
    referral: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        index: true,
        required: true,
        unique: true
    },
    email: {
        type: String,
        trim: true
    },
    district_incharge: {
        _id: String,
        name: String,
        area: String,
    },
    division_incharge: {
        _id: String,
        name: String,
        area: String,
    },
    cash_back: {
        type: Number,
        default: 0,
        min: 0
    },

    division: {
        type: String
    },
    district : {
        type: String
    },
    upazila: {
        type: String
    },

    address: {
        type: String,
        default: ''
    },
    agentCode: {
        type: String
    },
    uniqueId : {
        type: String,
        required : true,
        trim : true
    },
    deliveryAddress: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        trim: true
    },
    lastLogin: {
        type: Date
    },
    isBlocked: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    due: {
        type: Number,
        default: 0,
        min: 0
    },
    commission_provided: {
        type: Boolean,
        default: false
    },
    cash_in: [{
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        trx_id: {
            type: String,
            required: true
        }
    }],
    cash_out: [{
        date: {
            type: Date,
            default: Date.now,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        orderId: {
            type: String,
            required: true
        }
    }],
    log: {
        createdBy: String,
        updatedBy: String,
        updatedDate: Date,
        deletedBy: String,
        deletedDate: Date
    }
}, {
    timestamps: true
});
const agents = Mongoose.model('agents', agentsSchema);
module.exports = agents;
