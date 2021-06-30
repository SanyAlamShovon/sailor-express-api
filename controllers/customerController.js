const customerModel = require('./../models/customer');
const settingModel = require('./../models/setting');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const shortid = require('shortid')

const projection = {
    password: 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0,
    role: 0,
    lastLogin: 0
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

const allCustomer = async (req, res) => {
    try {
        let data = await customerModel.find({}, projection);
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

const signup = async (req, res) => {
    try {
        let check = await customerModel.findOne({ email: req.body.email,phone:req.body.phone})
        if (!check) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            req.body.password = hash;
            let data = await customerModel.create(req.body);
            if (data) {
                // let text = "Welcome to JMC.Shopping."
                // let smsUrl = "https://smsplus.sslwireless.com/api/v3/send-sms?api_token=601b554b-0d83-4620-a48f-8fe5d47e6d29&sid=JMCSHOPPINGBULK&sms="+text+"&msisdn="+req.body.phone+"&csms_id=signup"+data._id.toString();
                // axios.get(encodeURI(smsUrl))

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
                        token: token,
                        phone: data.phone,
                        address : data.address,
                        deliveryAddress : data.deliveryAddress,
                        email : data.email
                    },
                    success: true,
                    message: 'Congratulations! Account is created successfully.',
                });
            }
            else {
                res.status(409).json({
                    data: null,
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Customer exists with this information.",
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

const signin = async (req, res) => {
    try {
        let email = req.body.email;
        let password = req.body.password;
        let now = new Date();
        let data = await customerModel.findOne({ $or : [{email: email},{phone:email}] });
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
                let lastLogin = await customerModel.updateOne({ _id: data._id }, { $set: { lastLogin: now } });
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
                        address : data.address,
                        deliveryAddress : data.deliveryAddress,
                        email : data.email
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

const blockCustomer = async (req, res) => {
    try {
        let block = true;
        let str = 'blocked.'
        if (req.params.block == 1) {
            block = false;
            str = 'unblocked.'
        }
        let data = await customerModel.updateOne({ _id: req.params.id }, { $set: { isBlocked: block } })
        if (data) {
            res.status(202).json({
                success: true,
                message: "Customer is " + str
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't block customer"
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

const signinWith = async (req, res) => {
    try {
        let email = req.body.email;
        let now = new Date();
        let data = await customerModel.findOne({ email: email });
        if (data) {
            let lastLogin = await customerModel.updateOne({ _id: data._id }, { $set: { lastLogin: now } });
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
                    token: token,
                    phone: data.phone,
                    address : data.address,
                    email : data.email
                },
                success: true,
                message: 'Logged in successfully',
            });
        }
        else {
            res.status(401).json({
                data: null,
                success: false,
                message: 'No user available with this email. Please sign up.'
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

const customerByPhone = async (req, res) => {
    try {
        let data = await customerModel.findOne({ phone: req.params.phone }, { name: 1, address: 1, deliveryAddress: 1})
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

const forgotPassword = async(req,res)=>{
    try {
      let email = req.params.email;
      let valid = await customerModel.findOne({email:email},{email:1,name:1})
      if (valid) {
        let temp = email.split("@")
        let password = temp[0] + parseInt(Math.random()*100000);
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        let tempDate = new Date();
        let seconds = parseInt(tempDate.getTime()/1000);
        let update = await customerModel.updateOne({_id:valid._id},{$set:{password:hash}});
        if (update) {
            let mailOptions = {
                from: 'JMC Shopping', // sender address
                to: email, // list of receivers
                subject: 'Password Reset', // Subject line
                html: '<h3>Hello '+valid.name+'</h3><p>Your new password is <u>: '+password+'</u></p>' // html body
            };
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log("err : ",error);
                }
            });
            res.status(201).json({
                message: "You will receive a new password in your email.",
                success : true
            });
        }
      }else {
        res.status(409).json({
            success: false,
            message: "Invalid phone number"
        });
      }
    }catch (e) {
        console.log("ERROR:",e);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const updatePassword = async (req,res)=>{
    try {
        let data = await customerModel.findOne({_id:req.params.id});
        if(data){
              const match = await bcrypt.compare(req.body.oldPassword, data.password);
              if(match){
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.newPassword, salt);
                let pass = {password : hash};
                let updated = await customerModel.updateOne({_id:req.params.id},{$set:pass});
                if(updated){
                    res.status(202).json({
                        success: true,
                        message: "Password updated successfully.",
                    });
                }else{
                    res.status(401).json({
                        success: false,
                        message: "Password could not be updated"
                    });
                }
              }else{
                  res.status(401).json({
                      success: false,
                      message: "Old password mismatched."
                  });
              }
       }else{
        res.status(401).json({
            success: false,
            message: "Password mismatched."
        });
    }
    }catch (e) {
        console.log("ERROR:",err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const update = async (req,res) => {
    try{
        let update = await customerModel.updateOne({_id:req.params.id},{$set:req.body});
        let data = await customerModel.findOne({_id:req.params.id},projection);
        res.status(200).json({
            data : data,
            success : true,
            message : 'Profile updated!'
        });
    }catch(err){
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

function distance(lat1, lon1, lat2, lon2) {
    let R = 6371; // Radius of the earth in km
    let dLat = deg2rad(lat2 - lat1);  // deg2rad below
    let dLon = deg2rad(lon2 - lon1);
    let a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    let d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180)
}

module.exports = {
    allCustomer,
    signup,
    updatePassword,
    forgotPassword,
    update,
    blockCustomer,
    signin,
    customerByPhone,
    signinWith
};
