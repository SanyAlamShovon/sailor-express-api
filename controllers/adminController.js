const adminModel = require('./../models/admin');
const agentModel = require('./../models/agent');
const settingModel = require('./../models/setting');
const productModel = require('./../models/product');
const brandModel = require('./../models/brand');
const categoryModel = require('./../models/category');
const customerModel = require('./../models/customer');
const orderModel = require('../models/order');
const vendorModel = require('./../models/vendor');
const shortid = require('shortid');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const _ = require('lodash');
const bankInfoModel = require('./../models/bankpayments');
const smsService = require('./../middleware/smsService');

const projection = {
    password: 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    service: 'Gmail',
    secure: true, // true for 465, false for other ports
    port: 465,
    auth: {
        user: 'jmcmail@gmail.com', // generated ethereal user
        pass: 'jmcfashion' // generated ethereal password
    },
    ignoreTLS: true,
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false
});

const allAdmin = async (req, res) => {
    try {
        let data = await adminModel.find({role:req.params.role}, projection).sort({ createdAt: -1 });
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

const dashboard = async (req, res) => {
    try {
        let startDateMonth = moment().subtract(1, 'month')
        let startDateDay = moment().subtract(1, 'day')
        let totalProduct = await productModel.countDocuments({ forOnline: true, status: true });
        let unapprovedProduct = await productModel.countDocuments({ active: false });
        let totalVendor = await vendorModel.countDocuments({ isApproved: true, isBlocked: false });
        let orderLastMonth = await orderModel.countDocuments({ state: 3, createdAt: { $gte: startDateMonth } })
        let orderLastDay = await orderModel.countDocuments({ state: 3, createdAt: { $gte: startDateDay } })
        res.status(200).json({
            data: {
                totalProduct: totalProduct,
                totalVendor: totalVendor,
                orderLastMonth: orderLastMonth,
                orderLastDay: orderLastDay,
                unapprovedProduct: unapprovedProduct
            },
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


const createAdmin = async (req, res) => {
    try {
        let check = await adminModel.findOne({ email: req.body.email })
        if (!check) {
            req.body.permissions = _.uniqBy(req.body.permissions, 'flag');
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            req.body.password = hash;

            let adminRole;

            if(req.body.role=="incharge"){
                if(req.body.incharge=="div"){
                    let  count = await adminModel.countDocuments({ incharge: "div"})
                    count = count+1;
                    let idPrefix = "50707"
                    let inchargeId = ("000" + count).slice(-4);
                    let unique = idPrefix+inchargeId;
                    req.body.uniqueId = unique;
                    adminRole="Divisional In-Charge";
                }else{
                    let  count = await adminModel.countDocuments({ incharge: "dis"})
                    count = count+1;
                    let idPrefix = "50708"
                    let inchargeId = ("000" + count).slice(-4);
                    let unique = idPrefix+inchargeId;
                    req.body.uniqueId = unique;
                    adminRole="District In-Charge";
                }
            }else if(req.body.role=="admin"){
                let  count = await adminModel.countDocuments({ role: "admin"});
                count = count+1;
                let idPrefix = "50105";
                let employeeId = ("000" + count).slice(-4);
                console.log(idPrefix+employeeId);
                let unique = idPrefix+employeeId;
                req.body.uniqueId = unique;
                console.log(req.body)
                adminRole="Admin";
            }else{
                let  count = await adminModel.countDocuments({ role: "employee"});
                count = count+1;
                let idPrefix = "50105";
                let employeeId = ("000" + count).slice(-4);
                console.log(idPrefix+employeeId);
                let unique = idPrefix+employeeId;
                req.body.uniqueId = unique;
                console.log(req.body)
                adminRole="Employee";
            }

            let admin = await adminModel.create(req.body);

            if (admin) {
                smsService("Congratulations! You have successfully registered as Sailor's Express."+adminRole+".\nID: "+admin.uniqueId,admin.phone);
                console.log(adminRole);
                res.status(201).json({
                    data: admin,
                    message: "Admin created successfully.",
                    success: true
                });
            }else {
                res.status(409).json({
                    data: null,
                    message: "Admin create faild.",
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Admin already exists.",
                success: false
            });
        }
    } catch (err) {
        res.status(500).json({
            data: err,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const updateAdmin = async (req, res) => {
    try {
        let body;
        console.log('body', req.body.permissions.length);
        let permissions = _.uniqBy(req.body.permissions, 'flag');
        console.log('uniq', permissions.length);
        if (req.body.password) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            body = {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
                permissions: permissions,
                password: hash,
                incharge: req.body.incharge,
                area: req.body.area,
                idCard: req.body.idCard,
                bank: req.body.bank,
                address: req.body.address,
                phone: req.body.phone,
                joiningDate: req.body.joiningDate
            }
        } else {
            body = {
                name: req.body.name,
                email: req.body.email,
                role: req.body.role,
                permissions: permissions,
                incharge: req.body.incharge,
                area: req.body.area,
                idCard: req.body.idCard,
                bank: req.body.bank,
                address: req.body.address,
                phone: req.body.phone,
                joiningDate: req.body.joiningDate
            }
        }
        let update = await adminModel.updateOne({ _id: req.body._id }, { $set: body });
        let data = await adminModel.findOne({ _id: req.body._id }, projection)
        if (update) {
            res.status(201).json({
                data: data,
                message: "Admin updated successfully.",
                success: true
            });
        }
        else {
            res.status(409).json({
                data: null,
                success: false
            });
        }
    } catch (err) {
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const signin = async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let now = new Date();
        let data = await adminModel.findOne({ email: email }, { "permissions._id": 0 });
        if (data) {
            bcrypt.compare(password, data.password, async (err, valid) => {
                if (err) {
                    return res.status(401).json({
                        data: null,
                        success: false,
                        message: "Password Mismatch"
                    });
                }
                else if (!valid) {
                    return res.status(401).json({
                        data: null,
                        success: false,
                        message: "Password Mismatch"
                    });
                }
                else if (data.isBlocked) {
                    return res.status(401).json({
                        data: null,
                        success: false,
                        message: "Your Account Is Blocked."
                    });
                }
                let lastLogin = await adminModel.updateOne({ _id: data._id }, { $set: { lastLogin: now } });
                let in_charge = "";
                if(data.incharge!=null){
                    in_charge=data.incharge
                }
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
                    data: {
                        _id: data._id,
                        email: data.email,
                        name: data.name,
                        role: data.role,
                        superAdmin: data.superAdmin
                    }
                }, process.env.TokenSecret);
                return res.status(200).json({
                    data: {
                        _id: data._id,
                        uniqueId: data.uniqueId,
                        name: data.name,
                        email: data.email,
                        role: data.role,
                        incharge: in_charge,
                        permissions: _.orderBy(data.permissions, ['flag'], ['asc']),
                        isBlocked: data.isBlocked,
                        lastLogin: data.lastLogin,
                        token: token
                    },
                    success: true,
                    message: 'Logged in Successful',
                });
            });
        }
        else {
            res.status(401).json({
                data: null,
                success: false,
                message: 'Username Password combination is wrong'
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

const blockAdmin = async (req, res) => {
    try {
        let block = true;
        let str = 'blocked.'
        if (req.params.block == 1) {
            block = false;
            str = 'unblocked.'
        }
        let data = await adminModel.updateOne({ _id: req.params.id }, { $set: { isBlocked: block } })
        if (data) {
            res.status(202).json({
                success: true,
                message: "Admin is " + str
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't block admin"
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

const updatePassword = async (req, res) => {
    try {
        let data;
        if (req.user.role == 'admin' || req.user.role == "admin-sales" || req.user.role == "admin-inventory") {
            data = await adminModel.findOne({ _id: req.user._id });
        } else if (req.user.role == 'vendor' || req.user.role == "vendor-sales" || req.user.role == "vendor-inventory") {
            data = await vendorAdminModel.findOne({ _id: req.user._id });
        }
        if (data) {
            const match = await bcrypt.compare(req.body.oldPassword, data.password);
            if (match) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.newPassword, salt);
                req.body.newPassword = hash;
                let pass = { password: req.body.newPassword };
                let updated;
                if (req.user.role == 'admin' || req.user.role == "admin-sales" || req.user.role == "admin-inventory") {
                    updated = await adminModel.updateOne({ _id: req.user._id }, { $set: pass });
                } else if (req.user.role == 'vendor' || req.user.role == "vendor-sales" || req.user.role == "vendor-inventory") {
                    updated = await vendorAdminModel.updateOne({ _id: req.user._id }, { $set: pass });
                }
                if (updated) {
                    res.status(202).json({
                        success: true,
                        message: "Password updated successfully.",
                    });
                } else {
                    res.status(401).json({
                        success: false,
                        message: "Password could not be updated"
                    });
                }
            } else {
                res.status(401).json({
                    success: false,
                    message: "Password mismatched."
                });
            }
        }
    } catch (e) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const postSettings = async (req, res) => {
    try {
        let path = "public/logo.png";
        let path2 = "public/invoiceLogo.png";
        if (req.body.logo) {
            let image = req.body.logo.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
                .rotate()
                .toFile(path, (err, info) => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
        if (req.body.invoiceLogo) {
            let image = req.body.invoiceLogo.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
                .rotate()
                .toFile(path2, (err, info) => {
                    if (err) {
                        console.log(err);
                    }
                });
        }
        let body = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            tagLine: req.body.tagLine,
            whyUs: req.body.whyUs,
            aboutUs: req.body.aboutUs,
            address: req.body.address,
            facebook: req.body.facebook,
            instagram: req.body.instagram,
            logo: path,
            invoiceLogo: path2,
            badge: req.body.badge || false
        }
        let update = await settingModel.updateMany({}, { $set: body })
        let data = await settingModel.findOne({}, projection)
        res.status(202).json({
            data: data,
            success: true,
            message: "Info successfully updated!!"
        });
    } catch (e) {
        console.log("ERROR:", e);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const getSettings = async (req, res) => {
    try {
        let data = await settingModel.findOne({}, projection)
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (e) {
        console.log("ERROR:", e);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}


const addSlider = async (req, res) => {
    try {
        let url = "public/slider/" + shortid.generate() + ".jpg";
        let obj = {
            image: url,
            redirectUrl: req.body.redirectUrl
        }
        let image = req.body.slider.split(';base64,').pop();
        let inputBuffer = Buffer.from(image, 'base64')
        sharp(inputBuffer)
            .resize(800)
            .rotate()
            .toFile(url, (err, info) => {
                if (err) {
                    console.log(err);
                }
            });
        await settingModel.updateMany({}, { $push: { sliders: obj } })
        let data = await settingModel.findOne({}, { sliders: 1 })
        let sliders = data.sliders;
        if (sliders.length > 5) {
            sliders = sliders.slice(sliders.length - 6, sliders.length - 1)
        }
        res.status(202).json({
            data: sliders,
            success: true,
            message: "Slider successfully added!!"
        });
    } catch (e) {
        console.log("ERROR:", e);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allSliders = async (req, res) => {
    try {
        let data = await settingModel.findOne({}, { sliders: 1 })
        let sliders = data.sliders;
        if (sliders.length > 5) {
            sliders = sliders.slice(sliders.length - 6, sliders.length - 1)
        }
        res.status(200).json({
            data: sliders,
            success: true
        });
    } catch (e) {
        console.log("ERROR:", e);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const removeSlider = async (req, res) => {
    try {
        let update = await settingModel.update({}, { $pull: { sliders: { image: req.body.slider } } })
        if (update) {
            res.status(202).json({
                message: "Image removed successfully.",
                success: true
            });
        } else {
            res.status(409).json({
                message: "Image could not be removed.",
                success: false
            });
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


const addAgentCode = async (req, res) => {
    try {
        await settingModel.update({}, { $push: { agentCode: req.params.code } })
        res.status(202).json({
            message: "Code added successfully.",
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


const removeAgentCode = async (req, res) => {
    try {
        await settingModel.update({}, { $pull: { agentCode: req.params.code } })
        res.status(202).json({
            message: "Code removed successfully.",
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


const allAgentCode = async (req, res) => {
    try {
        let data = await settingModel.findOne({}, {agentCode:1})
        res.status(202).json({
            data : data.agentCode,
            message: "Code removed successfully.",
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


const payment = async (req, res) => {
    try {
        await adminModel.findByIdAndUpdate(req.body._id, {$inc:{balance:(req.body.amount)*(-1)}});
        res.status(200).json({
            data: null,
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


const allIncharge = async (req, res) => {
    try {
        let data = await adminModel.find(
            {
                "incharge":req.params.incharge
            },projection);
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


const allUnapprovedPayments = async (req, res) => { 
    try {
        let data = await bankInfoModel.find({status:0});
        if(data){
            let responseArray = [];
            for(var i=0;i<data.length;i++){
                let agent = await agentModel.findOne({_id:data[i].agentId});
                if(agent){
                    let responseData = {
                        "status": data[i].status,
                        "_id": data[i]._id,
                        "orderId": data[i].orderId,
                        "bank": data[i].bank,
                        "amount": data[i].amount,
                        "type": data[i].type,
                        "agentId": data[i].agentId,
                        "area": agent.upazila,
                        "uniqueId": agent.uniqueId,
                        "reffId": agent.agentId,
                        "name": agent.name,
                        "attachment": data[i].attachment,
                    }
                    responseArray.push(responseData);
                }
            }           
            res.status(200).json({
                data: responseArray,
                success: true
            });
        }else{
            res.status(409).json({
                data: "No data found!",
                success: true
            });
        }
    } catch (err) {
        res.status(500).json({
            data: err,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const allPayments = async (req, res) => {
    try {
        let data = await bankInfoModel.find();
        
        if(data){
            let responseArray = [];
            for(var i=0;i<data.length;i++){
                let agent = await agentModel.findOne({_id:data[i].agentId});
                if(agent){
                    let responseData = {
                        "status": data[i].status,
                        "_id": data[i]._id,
                        "orderId": data[i].orderId,
                        "bank": data[i].bank,
                        "amount": data[i].amount,
                        "type": data[i].type,
                        "agentId": data[i].agentId,
                        "area": agent.upazila,
                        "uniqueId": agent.uniqueId,
                        "reffId": agent.agentId,
                        "name": agent.name,
                        "attachment": data[i].attachment,
                    }
                    responseArray.push(responseData);
                }
            }           
            res.status(200).json({
                data: responseArray,
                success: true
            });
        }else{
            res.status(409).json({
                data: "No data found!",
                success: true
            });
        }
    } catch (err) {
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const approvePayment = async (req, res) => {
    try {
      let data =  await bankInfoModel.findByIdAndUpdate(req.params.paymentId, { $set: { status: 1 } })
      console.log(data);
      if(data){
          if(data.type=='cash_In'){
            let trx_id = mongoose.Types.ObjectId();
            let cash_in = {
                amount: data.amount,
                trx_id: trx_id
            }
            let agent = await agentModel.findByIdAndUpdate(data.agentId, 
                { $push: { cash_in: cash_in }, $inc: { balance: Number(data.amount) } }, { new: true });
            if (agent.cash_in.length==1) {
                console.log(agent)
                let dis_commission = (cash_in.amount * 3) / 100
                let div_commission = (cash_in.amount * 2) / 100
                await adminModel.updateOne({ _id: agent.district_incharge._id}, { $inc: { balance: dis_commission } })
                await adminModel.updateOne({ _id: agent.division_incharge._id}, { $inc: { balance: div_commission } })
            }
            console.log(agent)
          }else if(data.type=='order'){

          }else if(data.type=='emi'){
            let trueAmount = data.amount/0.6;
            let agent = await agentModel.findByIdAndUpdate(
                data.agentId, 
                { 
                    $inc: { 
                        due: (trueAmount) * (-1) } 
                    },{new:true}
            )
            await agentModel.findByIdAndUpdate(data.agentId, { $inc: { cash_back: (trueAmount) * (0.4) } },{new:true});
            await adminModel.findByIdAndUpdate(
                agent.district_incharge._id,
                {
                    $inc:{
                        balance: (trueAmount*3)/100
                    }
                }
            )
            await adminModel.findByIdAndUpdate(
                agent.division_incharge._id,
                {
                    $inc:{
                        balance: (trueAmount*2)/100
                    }
                }
            )
            let emiData =  await emiModel.create({
                agentId : agent._id,
                amount : data.amount,
                disInchargeId : agent.district_incharge._id,
                divInchargeId : agent.division_incharge._id
            });
            console.log(emiData)
          }
          res.status(200).json({
            success: true,
            message: "Payment approved!"
          });
      }else{
        res.status(409).json({
            success: true,
            message: "No record found!"
          });
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

module.exports = {
    allAdmin,
    createAdmin,
    updateAdmin,
    blockAdmin,
    signin,
    updatePassword,
    postSettings,
    getSettings,
    addSlider,
    allSliders,
    removeSlider,
    dashboard,
    addAgentCode,
    removeAgentCode,
    allAgentCode,
    payment,
    allIncharge,
    allUnapprovedPayments,
    allPayments,
    approvePayment
};
