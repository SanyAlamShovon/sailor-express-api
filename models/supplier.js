//models index
const Mongoose = require('./../config/db').Mongoose,
  Schema = Mongoose.Schema;

const supplierSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: true
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  vendorId: {
    type: String,
    required: true,
    index: true
  },
  due: {
    type: Number,
    default: 0
  },
  payments: [{
    amount: {
      type: Number
    },
    date: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String
    }
  }],
  tradeLicense: {
    number: String,
    image: String
  },
  idCard: { //passport or NID
    number: String,
    image: String
  },
  bank: {
    accountNumber: String,
    routingNumber: String,
    detail: String
  },
  contactPerson: {
    name: String,
    phone: String
  },
  mobileBanking: {
    number: String,
    platform: String //bkash, ucash, rocket, nagad
  },
  status: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});
const supplier = Mongoose.model('supplier', supplierSchema);
module.exports = supplier;
