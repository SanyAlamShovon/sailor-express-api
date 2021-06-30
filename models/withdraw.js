//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const withdrawSchema = new Schema({
    vendor :{
      _id : {
          type : String,
          required : true,
          index: true
        },
      name : {
          type : String,
          required : true
        }
    },
    amount : {
      type : Number,
      required : true
    },
    paymentMethod : {
      type : String
    }
},{
    timestamps: true
});
const withdraw = Mongoose.model('withdraw',withdrawSchema);
module.exports = withdraw;
