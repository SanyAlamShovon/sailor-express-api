const vendorModel = require('./../models/vendor');
const withdrawModel = require('./../models/withdraw');
const vendorAdminModel = require('./../models/vendorAdmin');
const productModel = require('./../models/product');
const adminModel = require('./../models/admin');

const sharp = require('sharp');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const { log } = require('console');
const _ = require('lodash');
const nanoid = require('nanoid').nanoid
const slug = require('slug')

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


const allVendor = async (req, res) => {
    try {
        let data = await vendorModel.find({}, projection).sort({ createdAt: -1 });
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


const allShops = async (req, res) => {
    try {
        let data = await vendorModel.find({featured:true,isBlocked:false, isApproved: true},{vendorName:1,thumbnail:1}).limit(400)
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

const createVendor = async (req, res) => {
    try {
        req.body.slug = slug(req.body.vendorName)
        let checkEmail = await vendorAdminModel.findOne({$or:[{ email: req.body.email },{slug:req.body.slug}]})
        if (!checkEmail) {
            let isApproved = false;
            if (req.user) {
                isApproved = true;
            }
            let vendorId = mongoose.Types.ObjectId();
            let check = await vendorModel.findOne({ vendorName: req.body.vendorName })
            if (!check) {
                let image = req.body.thumbnail.split(';base64,').pop();
                let path = "public/vendor/" + vendorId +".jpg";
                let path_large = "public/vendor/" + vendorId +"_1.jpg";
                let inputBuffer = Buffer.from(image, 'base64')
                sharp(inputBuffer)
                    .resize(1000)
                    .rotate()
                    .toFile(path_large, (err, info) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                sharp(inputBuffer)
                    .resize(200)
                    .rotate()
                    .toFile(path, (err, info) => {
                        if (err) {
                            console.log(err);
                        }
                    });
                let permissions = _.uniqBy(req.body.permissions,'flag');
                let vendorObj = {
                    _id: vendorId,
                    vendorName: req.body.vendorName,
                    phone: req.body.phone,
                    isApproved: isApproved,
                    permissions : permissions,
                    description: req.body.description,
                    address : req.body.address,
                    commission : req.body.commission,
                    thumbnail : path,
                    thumbnail_large : path_large,
                    featured : req.body.featured,
                    sizes : ['Free Size']
                }
                let vendor = await vendorModel.create(vendorObj)
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                let vendorAdminObj = {
                    vendorId: vendorId,
                    vendorName: req.body.vendorName,
                    name: req.body.name,
                    email: req.body.email,
                    role: "vendor",
                    password: hash
                }
                let vendorAdmin = await vendorAdminModel.create(vendorAdminObj);
                if (vendorAdmin) {
                    res.status(201).json({
                        data: vendor,
                        message: "Vendor created successfully.",
                        success: true
                    });
                } else {
                    res.status(409).json({
                        message: "Vendor could not be created.",
                        success: false
                    });
                }
            } else {
                res.status(409).json({
                    message: "Vendor already exists.",
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Vendor already exists.",
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

const signup = async (req, res) => {
    try {
        let checkEmail = await vendorAdminModel.findOne({ email: req.body.email })
        if (!checkEmail) {
            let vendorId = mongoose.Types.ObjectId();
            let check = await vendorModel.findOne({ vendorName: req.body.vendorName })
            if (!check) {
                // let path;
                // if (req.body.thumbnail) {
                //     let image = req.body.thumbnail.split(';base64,').pop();
                //     path = "public/vendor/" + vendorId +".jpg";
                //     let inputBuffer = Buffer.from(image, 'base64')
                //     sharp(inputBuffer)
                //         .resize(1200)
                //         .rotate()
                //         .toFile(path, (err, info) => {
                //             if (err) {
                //                 console.log(err);
                //             }
                //         });
                // }
                let vendorObj = {
                    _id: vendorId,
                    vendorName: req.body.vendorName,
                    phone: req.body.phone,
                    isApproved: false,
                    address : req.body.address,
                    sizes : ['Free Size']
                }
                let vendor = await vendorModel.create(vendorObj)
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync(req.body.password, salt);
                let vendorAdminObj = {
                    vendorId: vendorId,
                    vendorName: req.body.vendorName,
                    name: req.body.name,
                    email: req.body.email,
                    role: "vendor",
                    password: hash
                }
                let vendorAdmin = await vendorAdminModel.create(vendorAdminObj);
                if (vendorAdmin) {
                    res.status(201).json({
                        data: vendor,
                        message: "Signup successful.",
                        success: true
                    });
                } else {
                    res.status(409).json({
                        message: "Could not signup.",
                        success: false
                    });
                }
            } else {
                res.status(409).json({
                    message: "Vendor already exists.",
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Vendor already exists.",
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

const updateVendor = async (req, res) => {
    try {
        let path = "public/vendor/" + req.body._id +".jpg";
        let path_large = "public/vendor/" + req.body._id +"_1.jpg";
        if (req.body.thumbnail) {
            let image = req.body.thumbnail.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            req.body.thumbnail = path
            sharp(inputBuffer)
                .resize(200)
                .rotate()
                .toFile(path);
            sharp(inputBuffer)
                .resize(600)
                .rotate()
                .toFile(path_large);
        }
        if (req.body.tradeLicense && req.body.tradeLicense.image) {
            let imageName = nanoid(7);
            let image = req.body.tradeLicense.image.split(';base64,').pop();
            req.body.tradeLicense.image = "public/vendor/"+imageName+".jpg"
            let inputBuffer = Buffer.from(image, 'base64')
            await sharp(inputBuffer)
                .resize(1500)
                .rotate()
                .toFile(req.body.tradeLicense.image);
        }
        if (req.body.idCard && req.body.idCard.image) {
            let imageName = nanoid(7);
            let image = req.body.idCard.image.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            req.body.idCard.image = "public/vendor/"+imageName+".jpg"
            await sharp(inputBuffer)
                .resize(1500)
                .rotate()
                .toFile(req.body.idCard.image);
        }
        let documents = []
        if (req.body.documents && req.body.documents.length) {
            req.body.documents.map(async(item)=>{
                let imageName = nanoid(7);
                let image = item.split(';base64,').pop();
                let inputBuffer = Buffer.from(image, 'base64')
                let path = "public/vendor/"+imageName+".jpg"
                documents.push(path)
                await sharp(inputBuffer)
                    .resize(1500)
                    .rotate()
                    .toFile(path);
            })
            req.body.documents=documents
        }
        
        req.body.permissions = _.uniqBy(req.body.permissions,'flag');
        console.log(req.body);
        let update = await vendorModel.updateOne({ _id: req.body._id },{$set:req.body})
        let data = await vendorModel.findOne({ _id: req.body._id })
        if (update) {
            res.status(202).json({
                data : data,
                message: "Vendor updated successfully.",
                success: true
            });
        } else {
            res.status(409).json({
                message: "Vendor could not be updated.",
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

const addImage = async (req,res) => {
    try {
        let imageName = nanoid(7);
        let image = req.body.image.split(';base64,').pop();
        let path = "public/vendor/"+imageName+".jpg";
        let data = await vendorModel.updateOne({_id:req.body._id},{$push:{images:path}});
        let inputBuffer = Buffer.from(image, 'base64')
        sharp(inputBuffer)
            .resize(1000)
            .rotate()
            .toFile(path, (err, info) => {
                if (err) {
                    console.log(err);
                    res.status(409).json({
                        data : err,
                        message : "Image could not be added.",
                        success : false
                    });
                }else{
                    res.status(201).json({
                        data : vendor.images,
                        message : "Image added successfully.",
                        success : true
                    });
                }
            });
        let vendor = await vendorModel.findOne({_id:req.body._id},{images:1})
    }catch(err){
        console.log(err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const removeImage = async (req, res) => {
    try {
        let update = await vendorModel.updateOne({ _id: req.body._id },{$pull:{images:req.body.image}})
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

const allImage = async (req, res) => {
    try {
        let vendor = await vendorModel.findOne({_id:req.body._id},{images:1})
        if (vendor) {
            res.status(202).json({
                data : vendor.images,
                success: true
            });
        } else {
            res.status(409).json({
                data : null,
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
        let data = await vendorAdminModel.findOne({ email: email });
        if (data) {
            let vendor = await vendorModel.findOne({_id:data.vendorId},{permissions:1,isBlocked:1,isApproved:1})
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
                else if (!vendor.isApproved) {
                    return res.status(401).json({
                        data: null,
                        success: false,
                        message: "Your account is not approved yet."
                    });
                } else if (vendor.isBlocked || data.isBlocked) {
                    return res.status(401).json({
                        data: null,
                        success: false,
                        message: "Your account is blocked."
                    });
                } else {
                    let lastLogin = await vendorAdminModel.updateOne({ _id: data._id }, { $set: { lastLogin: now } });
                    let token = jwt.sign({
                        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365),
                        data: {
                            _id: data._id,
                            email: data.email,
                            name: data.name,
                            role: data.role,
                            vendorName: data.vendorName,
                            vendorId: data.vendorId
                        }
                    }, process.env.TokenSecret);
                    return res.status(200).json({
                        data: {
                            isApproved: data.isApproved,
                            isBlocked: data.isBlocked,
                            _id: data._id,
                            name: data.name,
                            email: data.email,
                            token: token,
                            vendorName: data.vendorName,
                            vendorId: data.vendorId,
                            permissions : vendor.permissions
                        },
                        success: true,
                        message: 'Logged in Successful',
                    });
                }
            });
        } else {
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

const blockVendor = async (req, res) => {
    try {
        let block = true;
        let str = 'blocked.'
        if (req.params.block == 1) {
            block = false;
            str = 'unblocked.'
            await productModel.updateMany({ vendorId: req.params.id }, { $set: { active: true } })
        }else{
            await productModel.updateMany({ vendorId: req.params.id }, { $set: { active: false } })
        }
        let vendor = await vendorModel.updateOne({ _id: req.params.id }, { $set: { isBlocked: block } })
        let vendorAdmin = await vendorAdminModel.updateMany({ vendorId: req.params.id }, { $set: { isBlocked: block } })
        if (vendor) {
            res.status(202).json({
                success: true,
                message: "Vendor is " + str
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't block vendor"
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

const approveVendor = async (req, res) => {
    try {
        let manager = await adminModel.findOne({_id:req.params.manager},{name:1,phone:1,email:1})
        let vendor = await vendorModel.updateOne({ _id: req.params.id }, { $set: { isApproved: true, manager: manager } })
        let vendorAdmin = await vendorAdminModel.updateOne({ vendorId: req.params.id }, { $set: { isApproved: true } })
        if (vendor) {
            res.status(202).json({
                success: true,
                message: "Vendor approved successfully."
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't approve vendor"
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

const createVendorAdmin = async (req, res) => {
    try {
        let check = await vendorAdminModel.findOne({ email: req.body.email })
        if (!check) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(req.body.password, salt);
            let vendorAdminObj = {
                vendorId: req.user.vendorId,
                vendorName: req.user.vendorName,
                name: req.body.name,
                email: req.body.email,
                role: "vendor",
                password: hash
            }
            let vendorAdmin = await vendorAdminModel.create(vendorAdminObj);
            let data = await vendorAdminModel.findOne({ _id: vendorAdmin._id }, projection);
            if (vendorAdmin) {
                res.status(201).json({
                    data: data,
                    message: "Vendor user created successfully.",
                    success: true
                });
            } else {
                res.status(409).json({
                    message: "Vendor user could not be created.",
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Vendor user already exists.",
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

const removeVendorAdmin = async (req, res) => {
    try {
        let remove = await vendorAdminModel.deleteOne({ _id: req.params.id })
        if (remove) {
            res.status(202).json({
                success: true,
                message: "User removed successfully."
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't remove user"
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

const allVendorAdmin = async (req, res) => {
    try {
        let data = await vendorAdminModel.find({ vendorId: req.params.vendorId }, projection).sort({ createdAt: -1 });
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

const getAllSizes = async (req, res) => {
    try {
        let data = await vendorModel.findOne({ _id: req.params.vendorId }, { sizes: 1 });
        console.log('g',data);
        if (data.sizes) {
            res.status(200).json({
                data: data.sizes,
                success: true
            });
        } else {
            res.status(200).json({
                data: [],
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

const saveSize = async (req, res) => {
    try {
        console.log('s',req.body.size);
        let data = await vendorModel.updateOne({ _id: req.params.vendorId }, { $addToSet: { sizes: req.body.size } });
        res.status(202).json({
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

const removeSize = async (req, res) => {
    try {
        let data = await vendorModel.updateOne({ _id: req.params.vendorId }, { $pull: { sizes: req.body.size } });
        res.status(202).json({
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

const updateVendorProfile = async (req, res) => {
    try {
        let path = "public/vendor/" + req.body._id +".jpg";
        let path_large = "public/vendor/" + req.body._id +"_1.jpg";
        if (req.body.thumbnail) {
            let image = req.body.thumbnail.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
                .resize(600)
                .rotate()
                .toFile(path);
            sharp(inputBuffer)
                .resize(200)
                .rotate()
                .toFile(path_large);
        }
        if (req.body.tradeLicense && req.body.tradeLicense.image) {
            let imageName = nanoid(7);
            let image = req.body.tradeLicense.image.split(';base64,').pop();
            req.body.tradeLicense.image = "public/vendor/"+imageName+".jpg"
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
                .resize(1500)
                .rotate()
                .toFile(req.body.tradeLicense.image);
        }
        if (req.body.idCard && req.body.idCard.image) {
            let imageName = nanoid(7);
            let image = req.body.idCard.image.split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            req.body.idCard.image = "public/vendor/"+imageName+".jpg"
            await sharp(inputBuffer)
                .resize(1500)
                .rotate()
                .toFile(req.body.idCard.image);
        }
        let documents = []
        if (req.body.documents && req.body.documents.length) {
            req.body.documents.map(async(item)=>{
                let imageName = nanoid(7);
                let image = item.split(';base64,').pop();
                let inputBuffer = Buffer.from(image, 'base64')
                let path = "public/vendor/"+imageName+".jpg"
                documents.push(path)
                await sharp(inputBuffer)
                    .resize(1500)
                    .rotate()
                    .toFile(path);
            })
        }
        let obj = {
            thumbnail: path,
            documents: documents,
            tradeLicense : req.body.tradeLicense,
            idCard : req.body.idCard,
            bank : req.body.bank,
            contactPerson : req.body.contactPerson,
            mobileBanking : req.body.mobileBanking
        }
        console.log(obj);
        let update = await vendorModel.updateOne({ _id: req.body._id },{$set:obj})
        let data = await vendorModel.findOne({ _id: req.body._id })
        if (update) {
            res.status(202).json({
                data : data,
                message: "Vendor updated successfully.",
                success: true
            });
        } else {
            res.status(409).json({
                message: "Vendor could not be updated.",
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


const getProfile = async (req, res) => {
    try {
        let data = await vendorModel.findOne({ _id: req.params.id },{permissions:0,isApproved:0,isBlocked:0,status:0,sizes:0,featured:0});
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
        let vendor = await vendorModel.findOne({_id:req.params.vendorId},{vendorName:1})
        let obj = {
            vendor : {
                _id : vendor._id,
                name : vendor.vendorName
            },
            amount : req.params.amount,
            paymentMethod : req.params.paymentMethod
        }
        await withdrawModel.create(obj);
        await vendorModel.updateOne({_id:req.params.vendorId},{$inc:{balance:(req.params.amount*(-1))}})
        let data = await vendorModel.findOne({_id:req.params.vendorId},{balance:1})
        res.status(202).json({
            data : data.balance,
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

module.exports = {
    allVendor,
    allShops,
    createVendor,
    signup,
    updateVendor,
    removeImage,
    blockVendor,
    signin,
    approveVendor,
    createVendorAdmin,
    allVendorAdmin,
    removeVendorAdmin,
    getAllSizes,
    saveSize,
    removeSize,
    addImage,
    allImage,
    pay,
    updateVendorProfile,
    getProfile
};
