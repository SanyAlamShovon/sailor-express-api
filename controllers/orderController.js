const orderModel = require('../models/order');
const customerModel = require('./../models/customer');
const productModel = require('./../models/product');
const saleModel = require('./../models/sale');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const shortid = require('shortid');
const axios = require('axios')
const agentModel = require('./../models/agent');


const moment = require('moment-timezone');
const vendorModel = require('./../models/vendor');
const SSLCommerz = require('sslcommerz');
const createOnlineInvoice = require("./../createOnlineInvoice.js").createInvoice;
const createOfflineInvoice = require("./../createOfflineInvoice.js").createInvoice;
const promoModel = require('../models/promo');

const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('1234567890', 4)

const projection = {
    updatedAt: 0,
    __v: 0
}

const ordersByDate = async (req, res) => { //online orders
    try {
        let data;
        let startDate = moment().subtract(1, 'month').format()
        let endDate = moment().format()
        if (req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        if (req.body.search) {
            let user = new RegExp(req.body.search, "i")
            let filter = {$or: [{ "customer.name": { "$regex": user } }, { "phone": { "$regex": user } }], "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        } else {
            let filter = { "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        }
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allOrders = async (req, res) => { //online orders
    try {
        let data;
        let startDate = moment().subtract(1, 'month').format()
        let endDate = moment().format()
        if (req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        if (req.body.search) {
            let user = new RegExp(req.body.search, "i")
            let filter = {$or: [{ "customer.name": { "$regex": user } }, { "phone": { "$regex": user } }], "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        } else {
            let filter = { "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        }
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allOrdersByVendor = async (req, res) => {
    try {
        let data;
        let startDate = moment().subtract(1, 'month').format()
        let endDate = moment().format()
        if (req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        if (req.body.search) {
            console.log(req.body.search.toLowerCase());
            let user = new RegExp(req.body.search, "i")
            let filter = { "vendorId": req.params.vendorId, $or: [{ "customer.name": { "$regex": user } }, { "phone": { "$regex": user } }], "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        } else {
            let filter = { "vendorId": req.params.vendorId, "createdAt": { "$gte": startDate, "$lte": endDate } }
            data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
        }
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allOrdersByCustomer = async (req, res) => {
    try {
        let data = await orderModel.find({ status: true, "customer._id": req.params.customerId }, projection).sort({ createdAt: -1 }).limit(100);
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allOrdersByAdmin = async (req, res) => { //admin orders, vendor orders
    try {
        let data;
        let startDate = moment().subtract(1, 'month').format()
        let endDate = moment().format()
        if (req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        if (req.user == 'vendor') {
            if (req.body.search) {
                let user = new RegExp(req.body.search, "i")
                let filter = { createdBy: 'vendor', "vendorId": req.user.vendorId, $or: [{ "customer.name": { "$regex": user } }, { "phone": { "$regex": user } }], "createdAt": { "$gte": startDate, "$lte": endDate } }
                data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
            } else {
                let filter = { createdBy: 'vendor', "vendorId": req.user.vendorId, "createdAt": { "$gte": startDate, "$lte": endDate } }
                data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
            }
        } else {
            if (req.body.search) {
                let user = new RegExp(req.body.search, "i")
                let filter = { createdBy: 'admin', $or: [{ "customer.name": { "$regex": user } }, { "phone": { "$regex": user } }], "createdAt": { "$gte": startDate, "$lte": endDate } }
                data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
            } else {
                let filter = { createdBy: 'admin', "createdAt": { "$gte": startDate, "$lte": endDate } }
                data = await orderModel.find(filter, projection).sort({ createdAt: -1 });
            }
        }
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const createOrder = async (req, res) => {
    try {
        let productIds = req.body.products.map((item) => {
            return item._id
        })
        let products = await productModel.find({ _id: { $in: productIds } }, { name: 1, price: 1, vat: 1, buyingPrice: 1, discount: 1, vendorId: 1, vendorName: 1 }).sort({ _id: 1 })
        let state = 0;
        let discount = 0;
        let id = mongoose.Types.ObjectId()
        let id_prefix  = "SEL"+nanoid();
        let orderCount = await orderModel.count();
        let orderId = orderCount.toString()
        while (orderId.length < 5) {
            orderId = "0" + orderId
        }
        orderId = id_prefix+orderId;
        let totalBill = 0;
        let deliveryCharge = 0;
        if (req.body.deliveryType == 1) {
            deliveryCharge = 50
        } else if (req.body.deliveryType == 2) {
            deliveryCharge = 100
        }
        totalBill += deliveryCharge
        let vat = 0
        let finalProducts = []
        products.map(async (item, index) => {
            let dis = 0;
            // if (item.discount.type == 1) {
            //     dis = item.discount.amount
            // } else {
            //     dis = item.price * item.discount.amount / 100;
            // }
            let quantity = 0
            let size;
            req.body.products.map((it) => {
                if (it._id == item._id) {
                    size = it.size
                    quantity = it.quantity
                }
            })
            let tempVat = item.price * item.vat / 100
            vat += (tempVat * quantity)
            totalBill += ((item.price - dis + tempVat) * quantity);
            finalProducts.push({
                _id: item._id,
                affiliate: item.affiliate,
                name: item.name,
                price: item.price,
                discount: dis,
                vat: tempVat,
                buyingPrice: item.buyingPrice,
                size: size,
                quantity: quantity,
                vendor: {
                    _id: item.vendorId,
                    name: item.vendorName
                }
            })
        })

        let orderObj = {
            _id: id,
            products: finalProducts,
            totalBill: totalBill,
            discount: discount,
            vat: vat,
            phone: req.body.phone,
            paymentType: req.body.paymentType,
            customer: req.body.customer,
            orderId: orderId,
            state: state,
            isOnline: true,
            deliveryType: req.body.deliveryType,
            deliveryCharge: deliveryCharge,
            createdBy: req.body.createdBy,
            invoice: 'public/invoice/' + orderId + '.pdf'
        }

        let total_amount = 0
        finalProducts.map((item) => {
            total_amount += (item.price * item.quantity)
        })
        let agent = await agentModel.findOne({ _id: req.body.customer._id })
        console.log(agent.balance+"----------"+total_amount);
        if (agent.balance<50000 || agent.balance < (total_amount / 2)) {
            res.status(409).json({
                data: null,
                message: "Insufficient balance!!",
                success: false
            });
            return
        }else{
            due = total_amount/2;
            orderObj.orderDue = due;
            orderObj.monthlyEmi = due/12;
            let create = await orderModel.create(orderObj)
            console.log('order : ', create);
            if (create) {
                finalProducts.map(async (item) => {
                    let vendor = await vendorModel.findOne({ _id: item.vendor._id }, { commission: 1 })
                    let vendorShare = parseInt(item.price * (100 - vendor.commission) / 100)
                    console.log(vendorShare);
                    await vendorModel.updateOne({ _id: item.vendor._id }, { $inc: { balance: vendorShare } })
                    let saleObj = {
                        product: {
                            _id: item._id,
                            name: item.name,
                            price: item.price - item.discount,
                            quantity: item.quantity
                        },
                        vendorShare: vendorShare,
                        vendor: item.vendor,
                        buyingPrice: item.buyingPrice,
                        customer: req.body.customer,
                        paymentType: req.body.paymentType,
                        orderId: id
                    }
                    await saleModel.create(saleObj)
                    await productModel.updateOne({ _id: item._id, "sizes.size": item.size }, { $inc: { "currentStock": -1, "sizes.$.stock": -1 } })
                })
                console.log('TA:'+total_amount);
                await agentModel.findByIdAndUpdate(req.body.customer._id, { $inc: { balance: (total_amount * (-1) / 2) } })
                await agentModel.findByIdAndUpdate(req.body.customer._id, { $inc: { due: (total_amount / 2) } })

            }
            createOnlineInvoice(create, 'public/invoice/' + orderId + '.pdf', 0);
            res.status(201).json({
                data: create,
                message: "Order created successfully.",
                success: true
            });
        }
        
        // let text = "We have received your order. Thank you for shopping with JMC."
        // let smsUrl = "https://smsplus.sslwireless.com/api/v3/send-sms?api_token=601b554b-0d83-4620-a48f-8fe5d47e6d29&sid=JMCSHOPPINGBULK&sms=" + text + "&msisdn=" + create.phone + "&csms_id=signup" +create._id.toString();
        // axios.get(encodeURI(smsUrl)).then((res) => {
        //     console.log(res.status);
        // }).catch((err) => {
        //     console.log(err);
        // })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const createOrderCustomer = async (req, res) => {
    try {
        let productIds = req.body.products.map((item) => {
            return item._id
        })
        let products = await productModel.find({ _id: { $in: productIds } }, { name: 1, price: 1, vat: 1, buyingPrice: 1, discount: 1, vendorId: 1, vendorName: 1 }).sort({ _id: 1 })
        let state = 0;
        let discount = 0;
        let id = mongoose.Types.ObjectId()
        let id_prefix  = "SEL"+nanoid();
        let orderCount = await orderModel.count();
        let orderId = orderCount.toString()
        while (orderId.length < 5) {
            orderId = "0" + orderId
        }
        orderId = id_prefix+orderId;
        let totalBill = 0;
        let deliveryCharge = 0;
        if (req.body.deliveryType == 1) {
            deliveryCharge = 50
        } else if (req.body.deliveryType == 2) {
            deliveryCharge = 100
        }
        totalBill += deliveryCharge
        let vat = 0
        let finalProducts = []
        products.map(async (item, index) => {
            let dis = 0;
            if (item.discount.type == 1) {
                dis = item.discount.amount
            } else {
                dis = item.price * item.discount.amount / 100;
            }
            let quantity = 0
            let size;
            req.body.products.map((it) => {
                if (it._id == item._id) {
                    size = it.size
                    quantity = it.quantity
                }
            })
            discount += (dis * quantity)
            let tempVat = item.price * item.vat / 100
            vat += (tempVat * quantity)
            totalBill += ((item.price - dis + tempVat) * quantity);
            finalProducts.push({
                _id: item._id,
                affiliate: item.affiliate,
                name: item.name,
                price: item.price,
                discount: dis,
                vat: tempVat,
                buyingPrice: item.buyingPrice,
                size: size,
                quantity: quantity,
                vendor: {
                    _id: item.vendorId,
                    name: item.vendorName
                }
            })
        })

        let orderObj = {
            _id: id,
            products: finalProducts,
            totalBill: totalBill,
            discount: discount,
            vat: vat,
            phone: req.body.phone,
            paymentType: req.body.paymentType,
            customer: req.body.customer,
            orderId: orderId,
            state: state,
            isOnline: true,
            deliveryType: req.body.deliveryType,
            deliveryCharge: deliveryCharge,
            createdBy: req.body.createdBy,
            invoice: 'public/invoice/' + orderId + '.pdf'
        }

        let total_amount = 0
        finalProducts.map((item) => {
            total_amount += (item.price * item.quantity)
        })
        let agent = await agentModel.findOne({ _id: req.body.customer._id })
        console.log(agent.balance+"----------"+total_amount);
        if (agent.balance<50000 || agent.balance < (total_amount / 2)) {
            res.status(409).json({
                data: null,
                message: "Insufficient balance!!",
                success: false
            });
            return
        }else{
            due = total_amount/2;
            orderObj.orderDue = due;
            orderObj.monthlyEmi = due/12;
            let create = await orderModel.create(orderObj)
            console.log('order : ', create);
            if (create) {
                finalProducts.map(async (item) => {
                    let vendor = await vendorModel.findOne({ _id: item.vendor._id }, { commission: 1 })
                    let vendorShare = parseInt(item.price * (100 - vendor.commission) / 100)
                    console.log(vendorShare);
                    await vendorModel.updateOne({ _id: item.vendor._id }, { $inc: { balance: vendorShare } })
                    let saleObj = {
                        product: {
                            _id: item._id,
                            name: item.name,
                            price: item.price - item.discount,
                            quantity: item.quantity
                        },
                        vendorShare: vendorShare,
                        vendor: item.vendor,
                        buyingPrice: item.buyingPrice,
                        customer: req.body.customer,
                        paymentType: req.body.paymentType,
                        orderId: id
                    }
                    await saleModel.create(saleObj)
                    await productModel.updateOne({ _id: item._id, "sizes.size": item.size }, { $inc: { "currentStock": -1, "sizes.$.stock": -1 } })
                })
                console.log('TA:'+total_amount);
                await agentModel.findByIdAndUpdate(req.body.customer._id, { $inc: { balance: (total_amount * (-1) / 2) } })
                await agentModel.findByIdAndUpdate(req.body.customer._id, { $inc: { due: (total_amount / 2) } })

            }
            createOnlineInvoice(create, 'public/invoice/' + orderId + '.pdf', 0);
            res.status(201).json({
                data: create,
                message: "Order created successfully.",
                success: true
            });
        }
        
        // let text = "We have received your order. Thank you for shopping with JMC."
        // let smsUrl = "https://smsplus.sslwireless.com/api/v3/send-sms?api_token=601b554b-0d83-4620-a48f-8fe5d47e6d29&sid=JMCSHOPPINGBULK&sms=" + text + "&msisdn=" + create.phone + "&csms_id=signup" +create._id.toString();
        // axios.get(encodeURI(smsUrl)).then((res) => {
        //     console.log(res.status);
        // }).catch((err) => {
        //     console.log(err);
        // })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const pay = async (req, res) => {
    try {
        let data = await orderModel.findOne({ _id: req.params.id })
        let customer = await customerModel.findOne({ _id: data.customer._id }, { name: 1, email: 1 })
        let email = 'info@jmc.shopping'
        if (customer.email) {
            email = customer.email
        }
        let sslcommerz = new SSLCommerz({
            store_id: 'jmcsh5fce5f60f3c0c',
            store_passwd: 'jmcsh5fce5f60f3c0c@ssl',
            total_amount: data.totalBill,
            currency: 'BDT',
            tran_id: data._id.toString(),
            success_url: 'https://jmc.shopping',// 'https://api.jmc.shopping/public/invoice/' + data.orderId + '.pdf',
            fail_url: 'https://jmc.shopping/fail',
            cancel_url: 'https://jmc.shopping',
            shipping_method: 'No',
            product_name: data.products[0].name,
            is_sent_email: 'Yes',
            refer: data.orderId,
            product_category: data.products[0].name,
            product_profile: 'physical-goods',
            cus_name: customer.name,
            cus_email: 'niloy.android@gmail.com',
            cus_add1: data.customer.address,
            cus_phone: data.phone,
            value_a: data.orderId,
            value_b: '0'
        }, true).then(response => {
            console.log(response);
            res.status(201).json({
                data: response.GatewayPageURL,
                success: true
            });
        }).catch(error => {
            console.log(error);
            res.status(409).json({
                data: null,
                success: false
            });
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const updateOrder = async (req, res) => {
    try {
        if (req.body.customer) {
            await orderModel.updateOne({ _id: req.params.id }, { $set: { "customer.deliverAddress": req.body.customer.deliveryAddress } })
        } else {
            let data = await orderModel.updateOne({ _id: req.params.id })
            let paymentStatus = data.paymentStatus;
            let state = data.state;
            let isOnline = data.isOnline;
            let discount = 0;
            let id = req.params.id
            if (data.paymentType == 0) {
                state = 5;
                paymentStatus = 1;
            }
            let productIds = req.body.products.map((item) => {
                return item._id
            })
            let products = await productModel.find({ _id: { $in: productIds } }, { name: 1, price: 1, vat: 1, buyingPrice: 1, discount: 1, vendorId: 1, vendorName: 1 })
            let totalBill = 0;
            let deliveryCharge = 0;
            if (data.deliveryType == 1) {
                deliveryCharge = 50
            } else if (data.deliveryType == 2) {
                deliveryCharge = 100
            }
            totalBill += deliveryCharge
            let vat = 0
            let finalProducts = []
            products.map((item) => {
                let dis = 0;
                if (item.discount.type == 1) {
                    dis = item.discount.amount
                } else {
                    dis = item.price * item.discount.amount / 100;
                }
                let quantity = 0
                let size;
                req.body.products.map((it) => {
                    if (it._id == item._id) {
                        size = it.size
                        quantity = it.quantity
                    }
                })
                discount += (dis * quantity)
                let tempVat = item.price * item.vat / 100
                vat += (tempVat * quantity)
                totalBill += ((item.price - dis + tempVat) * quantity);
                console.log('154 : ', totalBill);
                finalProducts.push({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    discount: dis,
                    vat: tempVat,
                    buyingPrice: item.buyingPrice,
                    size: size,
                    quantity: quantity,
                    vendor: {
                        _id: item.vendorId,
                        name: item.vendorName
                    }
                })
            })
            let orderObj = {
                products: finalProducts,
                totalBill: totalBill,
                discount: discount,
                vat: vat,
                customer: {
                    deliverAddress: customer.deliverAddress
                }
            }
            let create = await orderModel.updateOne({ _id: req.params.id }, { $set: orderObj })

            createOnlineInvoice(create, 'public/invoice/' + orderId + '.pdf');
        }
        res.status(201).json({
            data: data,
            message: "Order update successfully.",
            success: true
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const createOfflineOrder = async (req, res) => {
    try {
        if (req.body._id) {
            let orderData = await orderModel.findOne({ _id: req.body._id })
            let discount = 0;
            let orderId = orderData.orderId
            let productIds = req.body.products.map((item) => {
                return item._id
            })
            let products = await productModel.find({ _id: { $in: productIds } }, { name: 1, price: 1, vat: 1, buyingPrice: 1, discount: 1, vendorId: 1, vendorName: 1 })
            let totalBill = 0;
            let deliveryCharge = 0;
            if (orderData.deliveryType == 1) {
                deliveryCharge = 50
            } else if (orderData.deliveryType == 2) {
                deliveryCharge = 100
            }
            totalBill += deliveryCharge
            let vat = 0
            let finalProducts = []
            products.map((item) => {
                let dis = 0;
                if (item.discount.type == 1) {
                    dis = item.discount.amount
                } else {
                    dis = item.price * item.discount.amount / 100;
                }
                let quantity = 0
                let size;
                req.body.products.map((it) => {
                    if (it._id == item._id) {
                        size = it.size
                        quantity = it.quantity
                    }
                })
                discount += (dis * quantity)
                let tempVat = item.price * item.vat / 100
                vat += (tempVat * quantity)
                totalBill += ((item.price - dis + tempVat) * quantity);
                console.log('154 : ', totalBill);
                finalProducts.push({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    discount: dis,
                    vat: tempVat,
                    buyingPrice: item.buyingPrice,
                    size: size,
                    quantity: quantity,
                    vendor: {
                        _id: item.vendorId,
                        name: item.vendorName
                    }
                })
            })
            let orderObj = {
                products: finalProducts,
                totalBill: totalBill,
                discount: discount,
                vat: vat
            }
            await orderModel.updateOne({ _id: req.body._id }, { $set: orderObj })
            let data = await orderModel.findOne({ _id: req.body._id })
            createOnlineInvoice(data, 'public/invoice/' + orderId + '.pdf');
            res.status(201).json({
                data: data,
                message: "Order updated successfully.",
                success: true
            });
        } else {
            let paymentStatus = 0;
            let state = 0;
            let isOnline = false;
            let discount = 0;
            if (req.body.discount) {
                discount = req.body.discount
            }
            let id = mongoose.Types.ObjectId()
            if (req.body.paymentType == 0) {
                state = 5;
                paymentStatus = 1;
            }
            let orderCount = await orderModel.count();
            let orderId = orderCount.toString()
            while (orderId.length < 6) {
                orderId = "0" + orderId
            }
            let customer = await customerModel.findOne({ phone: req.body.phone })
            if (!customer) {
                customer = { phone: req.body.phone }
            }
            let productIds = req.body.products.map((item) => {
                return item._id
            })
            let vendorId
            if (req.user.role == 'vendor') {
                vendorId = req.user.vendorId
            }
            let products = await productModel.find({ _id: { $in: productIds } }, { name: 1, price: 1, vat: 1, buyingPrice: 1, discount: 1, vendorId: 1, vendorName: 1 })
            let totalBill = 0;
            let vat = 0;
            let finalProducts = []
            products.map((item) => {
                let dis = 0;
                if (item.discount.type == 1) {
                    dis = item.discount.amount
                } else {
                    dis = item.price * item.discount.amount / 100;
                }
                let quantity = 0
                let size;
                req.body.products.map((it) => {
                    if (it._id == item._id) {
                        size = it.size
                        quantity = it.quantity
                    }
                })
                let tempBill = ((item.price - dis) * quantity)
                discount += (dis * quantity)
                let tempVat = tempBill * item.vat / 100
                vat += tempVat
                tempBill += tempVat;
                totalBill += tempBill;
                finalProducts.push({
                    _id: item._id,
                    name: item.name,
                    price: item.price,
                    discount: dis,
                    vat: tempVat,
                    buyingPrice: item.buyingPrice,
                    size: size,
                    quantity: quantity,
                    vendor: {
                        _id: item.vendorId,
                        name: item.vendorName
                    }
                })
            })
            let orderObj = {
                _id: id,
                products: finalProducts,
                totalBill: totalBill - discount,
                vat: vat,
                discount: discount,
                paymentType: req.body.paymentType,
                customer: customer,
                phone: req.body.phone,
                orderId: orderId,
                state: state,
                isOnline: false,
                paymentStatus: paymentStatus,
                vendorId: vendorId,
                invoice: 'public/invoice/' + orderId + '.pdf',
                createdBy: req.user.role
            }
            let create = await orderModel.create(orderObj)
            let vendor = await vendorModel.findOne({ _id: vendorId }, { commission: 1, address: 1, vendorName: 1, phone: 1 })
            finalProducts.map(async (item) => {
                console.log(item.vendor._id);
                let saleObj = {
                    product: {
                        _id: item._id,
                        name: item.name,
                        price: item.price - item.discount,
                        quantity: item.quantity
                    },
                    isOnline: false,
                    vendor: item.vendor,
                    vendorShare: item.price,
                    buyingPrice: item.buyingPrice,
                    customer: customer,
                    paymentType: req.body.paymentType,
                    paymentStatus: paymentStatus,
                    orderId: id
                }
                await saleModel.create(saleObj)
                await productModel.updateOne({ _id: item._id, "sizes.size": item.size }, { $inc: { "currentStock": -1, "sizes.$.stock": -1 } })
            })
            createOnlineInvoice(create, 'public/invoice/' + orderId + '.pdf', vendor);
            if (create) {
                res.status(201).json({
                    data: create,
                    message: "Order created successfully.",
                    success: true
                });
            }
            else {
                res.status(409).json({
                    message: "Could not add to inventory.",
                    success: false
                });
            }
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const deleteOrder = async (req, res) => {
    try {
        let remove = await orderModel.findOneAndRemove({ _id: req.params.id }, { $set: { status: false } })
        console.log(remove)
        if (remove) {
            res.status(202).json({
                success: true,
                message: "Order deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't delete inventory."
            });
        }
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const updateOrderState = async (req, res) => {
    try {
        let order = await orderModel.findOne({ _id: req.params.id }, { products: 1, phone: 1 })
        let update = await orderModel.updateOne({ _id: req.params.id }, { $set: { state: req.params.val } })
        if (req.params.val == 4 || req.params.val == 6) {
            order.products.map(async (item) => {
                let updateProduct = await productModel.updateOne({ _id: item._id, "sizes.size": item.size }, { $inc: { currentStock: 1, "sizes.$.stock": 1 } })
            })
        }
        if (update) {
            if (req.params.val in [1, 2, 3, 4]) {
                let status = ["pending", "processing", "sent for delivery", "delivered", "returned", "Sold from physical store", "canceled"]
                // let text = "Your order is " + status[req.params.val]
                // let smsUrl = "https://smsplus.sslwireless.com/api/v3/send-sms?api_token=601b554b-0d83-4620-a48f-8fe5d47e6d29&sid=JMCSHOPPINGBULK&sms=" + text + "&msisdn=" + order.phone + "&csms_id=signup" + req.params.id.toString();
                // axios.get(encodeURI(smsUrl)).then((res) => {
                //     console.log(res.data);
                // }).catch((err) => {
                //     console.log(err);
                // })
            }
            res.status(202).json({
                success: true,
                message: "Order state updated successfully."
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't delete inventory."
            });
        }
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const updatePaymentStatus = async (req, res) => {
    try {
        let update = await orderModel.updateOne({ _id: req.params.id }, { $set: { paymentStatus: req.params.val } })
        let updateSales = await saleModel.updateOne({ _id: req.params.id }, { $set: { paymentStatus: req.params.val } })
        if (update) {
            res.status(202).json({
                success: true,
                message: "Payment status updated successfully."
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't update order."
            });
        }
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const orderStatus = async (req, res) => {
    try {
        let data = await orderModel.findOne({ orderId: req.params.orderId }, { orderStatus: 1, paymentStatus: 1, totalBill: 1 })
        if (data) {
            res.status(200).json({
                data: data,
                success: true
            });
        }
        else {
            res.status(200).json({
                data: null,
                success: false
            });
        }
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

module.exports = {
    ordersByDate,
    allOrders,
    createOrder,
    deleteOrder,
    updateOrderState,
    updatePaymentStatus,
    allOrdersByVendor,
    allOrdersByCustomer,
    createOfflineOrder,
    allOrdersByAdmin,
    orderStatus,
    updateOrder,
    pay
};
