//models index
const Mongoose = require('../config/db').Mongoose,
Schema = Mongoose.Schema;

const emiSchema = new Schema({
    agentId : {
        type : String,
        trim : true,
        required : true,
    },
    disInchargeId : {
        type : String,
        trim : true,
        required : true,
    },
    divInchargeId : {
        type : String,
        trim : true,
        required : true,
    },
    amount : {
        type : Number
    },
},{
    timestamps: true
});
const emi = Mongoose.model('emi',emiSchema);
module.exports = emi;
