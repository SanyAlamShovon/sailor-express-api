//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const saleSchema = new Schema({
    product : {
      _id : {
        type : String,
        required : true,
        index: true
      },
      name : {
        type : String,
        required : true
      },
      price : {
        type : Number,
        required : true
      },
      quantity : {
        type : Number,
        default : 1
      },
    },
    vendorShare : {
        type : Number,
        required : true
    },
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
    buyingPrice : {
      type : Number,
      required : true
    },
    customer : {
      _id : {
        type : String
      },
      name : {
        type : String
      }
    },
    orderId : {
      type : String,
      required : true,
      index: true
    },
    salesType : {
      type : Number, //0 = online sales, 1 = office sale, 2 = vendor shop sale
      default : 0
    },
    paymentType : {
      type : Number, // 0 = cash, 1 = cash on delevery, 2 = online payment, 3 = sent manually
      required : true
    },
    status : {
      type : Boolean,
      default : true
    }
},{
    timestamps: true
});
const sale = Mongoose.model('sale',saleSchema);
module.exports = sale;
