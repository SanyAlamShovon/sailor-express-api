const agentModel = require('./../models/agent');
const emiModel = require('./../models/emi');
const settingModel = require('./../models/setting');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const shortid = require('shortid');
const adminModel = require('./../models/admin');
const bankInfoModel = require('./../models/bankpayments');
const address = require('@bangladeshi/bangladesh-address');
const sharp = require('sharp');


const signup = async (req, res) => {
    try {
        let check = await agentModel.findOne({ phone: req.body.phone })
        let reff = await agentModel.findOne({ agentId: req.body.referral })
        if (!check&&reff) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            req.body.password = hash;
            req.body.deliveryAddress = req.body.address
            req.body.role = "user";

            let data= await agentModel.create(req.body);

            if (data) {
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
                    data: {
                        _id: data._id,
                        name: data.name,
                        role: data.role
                    }
                }, process.env.TokenSecret);
                return res.status(200).json({
                    data: {
                        token: token,
                        _id: data._id,
                        role: data.role,
                        name: data.name,
                        referral:data.referral,
                        phone: data.phone,
                        address: data.address,
                        deliveryAddress: data.deliveryAddress,
                        email: data.email,
                    },
                    success: true,
                    message: 'Congratulations! Account is created successfully.',
                });
            }else {
                res.status(409).json({
                    data: 'Create failed.',
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "User already exists with this phone number or invalid referral code.",
                success: false
            });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            data: err,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const signin = async (req, res) => {
    try {
        let phone = req.body.phone;
        let password = req.body.password;
        let now = new Date();
        let data = await agentModel.findOne({ phone: phone });
        console.log(data);
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
                let lastLogin = await agentModel.updateOne({ _id: data._id }, { $set: { lastLogin: now } });
                let token = jwt.sign({
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
                    data: {
                        _id: data._id,
                        email: data.email,
                        name: data.name,
                        role: data.role
                    }
                }, process.env.TokenSecret);
                return res.status(200).json({
                    data: {
                        _id: data._id,
                        name: data.name,
                        username: data.username,
                        token: token,
                        phone: data.phone,
                        role: data.role,
                        address: data.address,
                        deliveryAddress: data.deliveryAddress,
                        email: data.email
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

const blockUser = async (req, res) => {
    try {
        let block = true;
        let str = 'blocked.'
        if (req.params.block == 1) {
            block = false;
            str = 'unblocked.'
        }
        let data = await agentModel.updateOne({ _id: req.params.id }, { $set: { isBlocked: block } })
        if (data) {
            res.status(202).json({
                success: true,
                message: "Agent is " + str
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't block agent"
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
    signup,
    signin,
    blockUser
};