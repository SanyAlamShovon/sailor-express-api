const supplierModel = require('./../models/supplier');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const generateUniqueId = require('generate-unique-id');
const nanoid = require('nanoid').nanoid

const projection = {
    vendorId: 0,
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const allSupplier = async (req, res) => {
    try {
        let data = await supplierModel.find({ vendorId: req.params.vendorId, status: true }, projection);
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

const createSupplier = async (req, res) => {
    try {
        let check = await supplierModel.findOne({ name: req.body.name }, { _id: 1 })
        let images = []
        let bodyImages = req.body.images
        if (!check) {
            bodyImages.map(async (item) => {
                let id = generateUniqueId({
                    length: 6,
                    useLetters: false
                });
                let path = "public/product/" + id + ".jpg";
                images.push(path)
            })
            images.map((item, index) => {
                let image = bodyImages[index].split(';base64,').pop();
                let inputBuffer = Buffer.from(image, 'base64')
                sharp(inputBuffer)
                    .resize(1500)
                    .rotate()
                    .toFile(item, (err, info) => {
                        if (err) {
                            console.log(err);
                        }
                    });
            })
            req.body.images = images
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
            let data = await supplierModel.create(req.body);
            if (data) {
                res.status(201).json({
                    data: data,
                    message: "Supplier created successfully.",
                    success: true
                });
            }
            else {
                res.status(409).json({
                    message: "Supplier could not be created.",
                    success: false
                });
            }
        } else {
            res.status(409).json({
                message: "Supplier already exists.",
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

const deleteSupplier = async (req, res) => {
    try {
        let remove = await supplierModel.updateOne({ _id: req.params.id }, { $set: { status: false } })
        if (remove) {
            res.status(202).json({
                success: true,
                message: "Supplier deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success: false,
                message: "Couldn't delete Supplier."
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

const updateSupplier = async (req, res) => {
    try {
        let images = []
        let bodyImages = req.body.images
        if (bodyImages!=null && bodyImages.length>0) {
            bodyImages.map(async (item) => {
                let id = generateUniqueId({
                    length: 6,
                    useLetters: false
                });
                let path = "public/product/" + id + ".jpg";
                images.push(path)
            })
        }
        images.map((item, index) => {
            let image = bodyImages[index].split(';base64,').pop();
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
                .resize(1500)
                .rotate()
                .toFile(item, (err, info) => {
                    if (err) {
                        console.log(err);
                    }
                });
        })
        if (images.length) {
            await supplierModel.updateOne({ _id: req.body._id }, { $push: { $each: images } })
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
        let update = await supplierModel.updateOne(
            { _id: req.body._id },
            {
                $set: {
                    name: req.body.name,
                    phone: req.body.phone,
                    address: req.body.address,
                    tradeLicense: req.body.tradeLicense,
                    idCard: req.body.tradeLicense,
                    bank: req.body.body,
                    contactPerson: req.body.contactPerson,
                    mobileBanking: req.body.mobileBanking
                }
            }
        );
        if (update) {
            let data = await supplierModel.findOne({ _id: req.body._id }, projection)
            res.status(201).json({
                data: data,
                message: "Supplier updated successfully.",
                success: true
            });
        }
        else {
            res.status(409).json({
                message: "Supplier could not be updated.",
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

const pay = async (req, res) => {
    try {
        await supplierModel.updateOne({ _id: req.params.supplierId }, { $inc: { due: (req.params.amount * (-1)) } })
        await supplierModel.updateOne({ _id: req.params.supplierId }, { $push: { payments: { amount: req.params.amount, paymentMethod: req.params.paymentMethod } } })
        let supplier = await supplierModel.findOne({ _id: req.params.supplierId }, { due: 1 })
        res.status(202).json({
            data: supplier.due,
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
    allSupplier,
    createSupplier,
    deleteSupplier,
    updateSupplier,
    pay
};
