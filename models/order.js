//models index
const Mongoose = require('../config/db').Mongoose,
    Schema = Mongoose.Schema;

const orderSchema = new Schema({
    customer: {
        _id: {
            type: String,
            index: true
        },
        name: {
            type: String
        },
        address: {
            type: String
        },
        deliveryAddress: {
            type: String
        }
    },
    phone: {
        type: String,
        index: true
    },
    vendorId: {
        type: String,
        index: true,
    },
    products: [{
        _id: {
            type: String,
            required: true
        },
        affiliate: {
            type: String
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        discount: {
            type: Number,
            required: true
        },
        affiliate: {
            type: String
        },
        vat: {
            type: Number,
            default: 0
        },
        size: {
            type: String,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        },
        vendor: {
            _id: {
                type: String,
                required: true
            },
            name: {
                type: String,
                required: true
            }
        }
    }],
    deliveryCharge: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    vat: {
        type: Number,
        default: 0
    },
    totalBill: {
        type: Number,
        required: true
    },
    promo: {
        type: String
    },
    orderId: {
        type: String,
        required: true
    },
    invoice: {
        type: String
    },
    state: {
        type: Number, // 0 = pending, 1 = processing, 2 = send for delivery, delivered = 3, returned = 4, 5 = Sold from physical store, 6 = canceled
        default: 5
    },
    isOnline: {
        type: Boolean,
        default: true
    },
    paymentMethod: {
        type: String
    },
    deliveryType: {
        type: Number, // 0 = pickup, 1 = delivery inside dhaka, 2 = delivery outside dhaka, 3 = delivery in niketon
        default: 0
    },
    paymentType: {
        type: Number, // 0 = cash, 1 = cash on delevery, 2 = online payment
        default: 0
    },
    status: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
const order = Mongoose.model('order', orderSchema);
module.exports = order;
