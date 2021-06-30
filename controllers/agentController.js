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
const unirest = require('unirest');

const smsService = require('./../middleware/smsService');

const { customAlphabet } = require('nanoid')
const nanoid = customAlphabet('1234567890', 4)

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
    // auth: {
    //     user: 'jmcmail@gmail.com', // generated ethereal user
    //     pass: 'jmcfashion' // generated ethereal password
    // },
    ignoreTLS: true,
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false
});

const allAgent = async (req, res) => {
    try {
        let data = await agentModel.find({}, projection);
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
        let check = await agentModel.findOne({ phone: req.body.phone })
            if (!check) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                req.body.password = hash;
                req.body.deliveryAddress = req.body.address

                let dis_incharge = await adminModel.findOne({incharge:'dis', area: req.body.district})
                let div_incharge = await adminModel.findOne({incharge:'div', area: req.body.division})


                let division_incharge = {
                    _id: div_incharge._id,
                    name: div_incharge.name,
                    area: div_incharge.area
                }

                let district_incharge = {
                    _id: dis_incharge._id,
                    name: dis_incharge.name,
                    area: dis_incharge.area
                }


                let  count = await agentModel.countDocuments({ role: "agent"})
                count = count+1;
                let idPrefix = "50709"
                let inchargeId = ("000" + count).slice(-4);
                let unique = idPrefix+inchargeId;
                req.body.uniqueId = unique;

                req.body.district_incharge=district_incharge;
                req.body.division_incharge=division_incharge;
                req.body.role = "agent";

                console.log(req.body.division_incharge)

                let agentId = req.body.upazila.substring(0, 2).toLowerCase()+"-"+nanoid();
                req.body.agentId = agentId;

                let data = await agentModel.create(req.body);

                if (data) {
                    smsService("Congratulation!\nYou have successfully registered as sailor's e-Agent.\nId: "+data.uniqueId+"\nCode: "+data.agentId,data.phone);
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
                            _id: data._id,
                            name: data.name,
                            agentId:agentId,
                            uniqueId: data.uniqueId,
                            token: token,
                            phone: data.phone,
                            division: data.division,
                            district : data.district,
                            upazila: data.upazila,
                            address: data.address,
                            deliveryAddress: data.deliveryAddress,
                            email: data.email,
                            phoneAuth: data.phoneAuth,
                            district_incharge: data.district_incharge,
                            division_incharge: data.division_incharge
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
                    message: "Agent exists with this information.",
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
                        uniqueId: data.uniqueId,
                        refId : data.agentId,
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

const blockAgent = async (req, res) => {
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

const signinWith = async (req, res) => {
    try {
        let email = req.body.email;
        let now = new Date();
        let data = await agentModel.findOne({ email: email });
        if (data) {
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
                    token: token,
                    phone: data.phone,
                    address: data.address,
                    email: data.email
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

const agentByPhone = async (req, res) => {
    try {
        let data = await agentModel.findOne({ phone: req.params.phone }, { name: 1, address: 1, deliveryAddress: 1 })
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

const forgotPassword = async (req, res) => {
    try {
        let email = req.params.email;
        let valid = await agentModel.findOne({ email: email }, { email: 1, name: 1 })
        if (valid) {
            let temp = email.split("@")
            let password = temp[0] + parseInt(Math.random() * 100000);
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(password, salt);
            let tempDate = new Date();
            let seconds = parseInt(tempDate.getTime() / 1000);
            let update = await agentModel.updateOne({ _id: valid._id }, { $set: { password: hash } });
            if (update) {
                // let mailOptions = {
                //     from: 'JMC Shopping', // sender address
                //     to: email, // list of receivers
                //     subject: 'Password Reset', // Subject line
                //     html: '<h3>Hello ' + valid.name + '</h3><p>Your new password is <u>: ' + password + '</u></p>' // html body
                // };
                // transporter.sendMail(mailOptions, (error, info) => {
                //     if (error) {
                //         console.log("err : ", error);
                //     }
                // });
                res.status(201).json({
                    message: "You will receive a new password in your email.",
                    success: true
                });
            }
        } else {
            res.status(409).json({
                success: false,
                message: "Invalid phone number"
            });
        }
    } catch (e) {
        console.log("ERROR:", e);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const updatePassword = async (req, res) => {
    try {
        let data = await agentModel.findOne({ _id: req.params.id });
        if (data) {
            const match = await bcrypt.compare(req.body.oldPassword, data.password);
            if (match) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.newPassword, salt);
                let pass = { password: hash };
                let updated = await agentModel.updateOne({ _id: req.params.id }, { $set: pass });
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
                    message: "Old password mismatched."
                });
            }
        } else {
            res.status(401).json({
                success: false,
                message: "Password mismatched."
            });
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

const update = async (req, res) => {
    try {
        let employee = await adminModel.find(
            {
                $or: [{
                    _id: req.body.district_incharge
                }, {
                    _id: req.body.division_incharge
                }]
            }, {
                name: 1
            }
        )
        console.log(employee);
        employee.map(async(item) => {
            if (item._id == req.body.district_incharge) {
                console.log(item,1);
                await agentModel.findByIdAndUpdate(req.body._id,{$set:{district_incharge:item}})
            } else {
                console.log(item,2);
                await agentModel.findByIdAndUpdate(req.body._id,{$set:{division_incharge:item}})
            }
        })
        delete req.body.district_incharge
        delete req.body.division_incharge
        let update = await agentModel.findByIdAndUpdate(req.body._id, { $set: req.body }, { new: true });
        res.status(200).json({
            data: update,
            success: true,
            message: 'Agent updated!'
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

const agentProfile = async (req, res) => {
    try {
        let data = await agentModel.findOne({ _id: req.params.id }, projection);
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


const pay = async (req, res) => {
    try {
        let trx_id = mongoose.Types.ObjectId();
        let cash_in = {
            amount: req.body.amount,
            trx_id: trx_id
        }
        let agent = await agentModel.findByIdAndUpdate(req.body._id, 
            { $push: { cash_in: cash_in }, $inc: { balance: Number(req.body.amount) } }, { new: true });
        if (agent.cash_in.length==1) {
            console.log(agent)
            let dis_commission = (cash_in.amount * 3) / 100
            let div_commission = (cash_in.amount * 2) / 100
            await adminModel.updateOne({ _id: agent.district_incharge._id}, { $inc: { balance: dis_commission } })
            await adminModel.updateOne({ _id: agent.division_incharge._id}, { $inc: { balance: div_commission } })
        }
        res.status(200).json({
            data: {
                redirectUrl: 'https://www.google.com'
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


const payment = async (req, res) => {
    try {
        await agentModel.findByIdAndUpdate(req.body._id, { $inc: { cash_back: (req.body.amount) * (-1) } });
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

const bankPayment = async (req, res) => {
    try {   
        // console.log(address.districtOf(DivisionName.Dhaka))
        // console.log(address.upazilasOf("tangail"))
        let id = mongoose.Types.ObjectId();
        let image = req.body.attachment.split(';base64,').pop();
        let path = "public/attachment/" + id + ".jpg";
        let inputBuffer = Buffer.from(image, 'base64')
        sharp(inputBuffer)
            .rotate()
            .toFile(path, (err, info) => {
            if (err) {
                console.log(err);
            }
        });
        req.body.attachment = path;
        console.log(path+"-------")

        let data = await bankInfoModel.create(req.body);
        if(data){
            res.status(200).json({
                data: data,
                success: true
            });
        }else{
            res.status(409).json({
                data: "Failed",
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



const agentBankPayments = async (req, res) => {
    try {
        let data = await bankInfoModel.find({agentId:req.params.id});
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

const balanceRecharge = async (req, res) => {
    try {   
        // console.log(address.districtOf(DivisionName.Dhaka))
        // console.log(address.upazilasOf("tangail"))
        let id = mongoose.Types.ObjectId();
        let image = req.body.attachment.split(';base64,').pop();
        let path = "public/attachment/" + id + ".jpg";
        let inputBuffer = Buffer.from(image, 'base64')
        sharp(inputBuffer)
            .resize(200)
            .rotate()
            .toFile(path, (err, info) => {
            if (err) {
                console.log(err);
            }
        });

        req.body.attachment = path;
        req.body.type = "cash-in";
        let data;
        try{
            data = await bankInfoModel.create(req.body);
        }catch(err){
            res.status(500).json({
                data: null,
                success: false,
                message: "Data storing failed."
            });
        }
        
        res.status(200).json({
            data: data,
            success: true
        });
    } catch (err) {
        console.log(err)
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

const emi = async (req, res) => {
    try {
        let trueAmount = req.body.amount/0.6;
        let agent = await agentModel.findByIdAndUpdate(
            req.body._id, 
            { 
                $inc: { 
                    due: (trueAmount) * (-1) } 
                },{new:true}
        )
        console.log("1st query...");
        
        await agentModel.findByIdAndUpdate(req.body._id, { $inc: { cash_back: (trueAmount) * (0.4) } },{new:true});
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
            amount : req.body.amount,
            disInchargeId : agent.district_incharge._id,
            divInchargeId : agent.division_incharge._id
        });
        
        res.status(200).json({
            data: emiData,
            success: true
        });
    } catch (err) {
        res.status(500).json({
            data: err,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}


const ipn = async (req, res) => {
    try {
        console.log(req.body.val_id, req.params.id);
        // let url = "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=" + req.body.val_id + "&store_id=jmcshoppinglive&store_passwd=5F1971533C1B477758&format=json"
        let url = "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=" + req.body.val_id + "&store_id=jmcsh5fce5f60f3c0c&store_passwd=jmcsh5fce5f60f3c0c@ssl&format=json"
        axios.get(url)
            .then(async function (response) {
                if (response.status == 200) {
                    let cash_in = {
                        amount: Number(req.body.amount),
                        trx_id: req.body.tran_id
                    }
                    let agent = await agentModel.findByIdAndUpdate(req.body._id, { $push: { cash_in: cash_in }, $inc: { balance: Number(req.body.amount) } }, { new: true });
                    if (agent.cash_in.length==1) {
                        let dis_commission = (cash_in.amount * 3) / 100
                        let div_commission = (cash_in.amount * 2) / 100
                        await adminModel.updateOne({ _id: agent.district_incharge }, { $inc: { balance: dis_commission } })
                        await adminModel.updateOne({ _id: agent.division_incharge }, { $inc: { balance: div_commission } })
                    }
                }
            })
        res.status(200).json({
            success: true
        });
    } catch (err) {
        console.log("ERROR:", err);
        res.status(500).json({
            data: null,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}


const sendSms = async (req,res) => {
    try{
        let msg = req.body.content;
        let phone = req.body.phone;
        smsService(msg,phone);
        
        res.status(200).json({
            data: "Sms successful..",
            success: true
        });
    } catch (err) {
        res.status(500).json({
            data: err,
            success: false,
            message: "Internal Server Error Occurred."
        });
    }
}

module.exports = {
    allAgent,
    signup,
    updatePassword,
    forgotPassword,
    update,
    blockAgent,
    signin,
    agentByPhone,
    signinWith,
    agentProfile,
    pay,
    payment,
    bankPayment,
    balanceRecharge,
    emi,
    ipn,
    agentBankPayments,
    sendSms
};
