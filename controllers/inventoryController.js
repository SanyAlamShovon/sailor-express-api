const inventoryModel = require('../models/inventory');
const productModel = require('./../models/product');
const vendorModel = require('./../models/vendor');
const mongoose = require('mongoose');
const supplierModel = require('./../models/supplier');
const schema = mongoose.Schema;
const sharp = require('sharp');


const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const allInventoryByVendor = async (req,res) => {
    try{
        let data = await inventoryModel.find({vendorId:req.params.vendorId,status:true},projection).sort({createdAt:-1});
        let product = await productModel.find({vendorId:req.params.vendorId,status:true},{name:1});
        let vendor = vendorModel.findOne({_id:req.params.vendorId},{sizes:1})
        res.status(200).json({
            data : {
                inventory : data,
                product : product,
                size : vendor.sizes
            },
            success : true
        });
    }catch(err){
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const createInventory = async (req,res) => {
    try {
        let supplier;
        if (req.body.supplierId) {
            supplier = await supplierModel.findOne({_id:req.body.supplierId},{name:1})
            await supplierModel.updateOne({_id:req.body.supplierId},{$inc:{due:req.body.due}})
            req.body.supplier = {
                _id : supplier._id,
                name : supplier.name
            }
        }
        let id = mongoose.Types.ObjectId();
        req.body._id = id
        if (req.body.image) {
            let image = req.body.image.split(';base64,').pop();
            let path = "public/inventory/" + id + ".jpg";
            req.body.image = path;
            let inputBuffer = Buffer.from(image, 'base64')
            sharp(inputBuffer)
            .resize(2400)
            .rotate()
            .toFile(path, (err, info) => {
                if (err) {
                console.log(err);
                }
            });
        }
        let product = await productModel.findOne({_id:req.body.productId},{name:1})
        req.body.product = {
            _id : product._id,
            name : product.name
        }
        if (!req.body.size) {
            req.body.size = "Free size"
        }
        let data = await inventoryModel.create(req.body);
        let check = await productModel.findOne({_id:req.body.productId,"sizes.size":req.body.size},{_id:1})
        let buyingPrice = req.body.buyingPrice/req.body.stock;
        if (check) {
            let updateProduct = await productModel.updateOne({_id:req.body.productId,"sizes.size":req.body.size},{$inc:{"sizes.$.stock":req.body.stock}})
            let updateStock = await productModel.updateOne({_id:req.body.productId},{$set:{price:req.body.sellingPrice,buyingPrice:buyingPrice,expireDate:req.body.expireDate},$inc:{currentStock:req.body.stock}})
        }else{
            let updateProduct = await productModel.updateOne({_id:req.body.productId},{$push:{sizes:{size:req.body.size,stock:req.body.stock}}})
            let updateStock = await productModel.updateOne({_id:req.body.productId},{$set:{price:req.body.sellingPrice,buyingPrice:buyingPrice,expireDate:req.body.expireDate},$inc:{currentStock:req.body.stock}})
        }
        if(data){
            res.status(201).json({
                data : data,
                message : "Added to inventory successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Could not add to inventory.",
              success : false
            });
        }
    }catch(err){
        console.log(err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const deleteInventory = async (req,res) => {
    try{
        let data = await inventoryModel.findOne({_id:req.params.id},{size:1,stock:1,productId:1})
        let remove = await inventoryModel.updateOne({_id : req.params.id},{$set:{status:false}})
        let updateProduct = await productModel.updateOne({_id:data.productId,"sizes.size":data.size},{$inc:{"sizes.$.stock":data.stock*(-1),currentStock:(data.stock*(-1))}})
        if(remove){
            res.status(202).json({
                success : true,
                message : "Inventory deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success : false,
                message : "Couldn't delete inventory."
            });
        }
    }catch(err){
        console.log("ERROR:",err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

module.exports =  {
    allInventoryByVendor,
    createInventory,
    deleteInventory
};
