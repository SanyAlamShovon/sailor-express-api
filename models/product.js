//models index
const Mongoose = require('./../config/db').Mongoose,
  Schema = Mongoose.Schema;
let dataTables = require('mongoose-datatables')
const mongoose_fuzzy_searching = require('mongoose-fuzzy-searching');

const productSchema = new Schema({
  name: {
    type: String,
    trim: true,
    index: true,
    required: true
  },
  description: {
    type: String
  },
  slug: {
    type: String,
    trim: true,
    index: true,
    required: true,
    unique: true
  },
  images: [String],
  thumbnail: {
    type: String,
    required: true
  },
  sizes: [{
    size: {
      type: String
    },
    stock: {//current stock
      type: Number,
      default: 0
    }
  }],
  vendorId: {
    type: String,
    index: true,
    required: true
  },
  vendorName: {
    type: String,
    required: true
  },
  brand: {
    _id: {
      type: String,
      index: true,
    },
    name: String,
    image: String,
  },
  category: {
    _id: {
      type: String,
      index: true,
    },
    name: String
  },
  subcategory: {
    _id: {
      type: String,
      index: true,
    },
    name: String
  },
  subsubcategory: {
    _id: {
      type: String,
      index: true
    },
    name: String
  },
  price: {
    type: Number,
    default: 0
  },
  vat: {
    type: Number,
    default: 0
  },
  discount: {
    amount: {
      type: Number,
      default: 0
    },
    type: {
      type: Number, //flat = 1, percentage = 2
      default: 1
    }
  },
  freeDelivery: {
    type: Boolean,
    default: false
  },
  buyingPrice: {
    type: Number,
    default: 0
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  barcode: {
    type: String,
    required: true
  },
  status: {//false if deleted
    type: Boolean,
    default: true
  },
  forOnline: {
    type: Boolean,
    default: true
  },
  currentStock: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  newArrival: {
    type: Boolean,
    default: false
  },
  forAgent: {
    type: Boolean,
    default: false
  },
  forCampaign: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: false
  },
  topSelling: {
    type: Boolean,
    default: false
  },
  expireDate: {
    type: Date
  }
}, {
  timestamps: true
});

productSchema.plugin(dataTables)
productSchema.plugin(mongoose_fuzzy_searching, { fields: ['name'] });

const product = Mongoose.model('product', productSchema);
module.exports = product;
