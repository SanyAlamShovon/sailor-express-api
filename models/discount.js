//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const discountsSchema = new Schema({
    method : {
        type : String,
        trim : true,
        required : true
    },
    discount : {
        amount : {
          type : Number,
          default : 0
        },
        type : {
          type : Number, //flat = 1, percentage = 2
          default : 1
        }
      },
},{
    timestamps: true
});
const discounts = Mongoose.model('discounts',discountsSchema);
module.exports = discounts;
