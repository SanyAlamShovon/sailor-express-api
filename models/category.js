//models index
const Mongoose = require('./../config/db').Mongoose,
    Schema = Mongoose.Schema;

const categorySchema = new Schema({
    name : {
        type : String,
        trim : true,
        index: true,
        required : true
    },
    active: {
      type: Boolean,
      default: true
    },
    subcategory : [{
      name : {
        type : String,
        index: true,
        trim : true
      },
      slug : {
          type : String,
          index: true,
          trim : true
      },
      active: {
        type: Boolean,
        default: true
      },
      image : {
        type : String
      },
      image_large: String
    }],
    image : {
      type : String
    },
    image_large: String,
    slug : {
        type : String,
        index: true,
        trim : true,
        unique : true,
        required: true
    },
    featured : {
      type : Boolean,
      default : true
    },
    status : {
      type : Boolean,
      default : true
    }
},{
    timestamps: true
});
const category = Mongoose.model('category',categorySchema);
module.exports = category;
