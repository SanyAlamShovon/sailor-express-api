//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const subsubcategorySchema = new Schema({
    name : {
        type : String,
        trim : true,
        required : true,
        index: true
    },
    slug : {
        type : String,
        index: true,
        trim : true,
        unique : true,
        required: true
    },
    image : {
      type : String
    },
    image_large: String,
    subcategory : {
      _id : String,
      slug : String,
      name : String
    }
},{
    timestamps: true
});
const subsubcategory = Mongoose.model('subsubcategory',subsubcategorySchema);
module.exports = subsubcategory;
