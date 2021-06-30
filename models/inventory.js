//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const inventorySchema = new Schema({
    product : {
      _id : {
        type : String,
        required : true
      },
      name : {
        type : String,
        required : true
      }
    },
    supplier : {
      _id : {
        type : String
      },
      name : {
        type : String
      }
    },
    vendorId : {
      type : String,
      index: true,
      required : true
    },
    buyingPrice : { //total
      type : Number,
      required : true
    },
    paid : { //total amount paid
      type : Number,
      default : 0
    },
    due : { //total due amount
      type : Number,
      default : 0
    },
    size : {
      type : String,
      required : true
    },
    stock : {
      type : Number,
      required : true
    },
    color : {
      type : String
    },
    invoiceNo : {
      type : String
    },
    gatePassNo : {
      type : String
    },
    image : {
      type : String
    },
    sellingPrice : { //per unit
      type : Number,
      required : true
    },
    expireDate : {
      type : Date
    },
    status : {
      type : Boolean,
      default : true
    }
},{
    timestamps: true
});
const inventory = Mongoose.model('inventory',inventorySchema);
module.exports = inventory;
