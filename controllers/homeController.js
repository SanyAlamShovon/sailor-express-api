const adminModel = require('./../models/admin');
const settingModel = require('./../models/setting');
const productModel = require('./../models/product');
const categoryModel = require('./../models/category');
const vendorModel = require('./../models/vendor');
const customerModel = require('./../models/customer');
const brandModel = require('./../models/brand');
const subsubcategoryModel = require('../models/subsubcategory');

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const home = async (req,res)=>{
    try {
        let data = await settingModel.findOne({},projection)
        let brand = await brandModel.find({active:true,},{name:1,image:1,slug:1,active:1}).limit(12).sort({createdAt:1})
        let featuredCategory = await categoryModel.find({active:true,featured:true,status:true},{name:1,image:1}).limit(12)
        let category = await categoryModel.find({active:true,status:true},{name:1,image:1}).sort({createdAt:1})
        let vendor = await vendorModel.find({featured:true,isBlocked:false},{vendorName:1,thumbnail:1}).limit(12)
        let topSelling = await productModel.find({forOnline:true, topSelling:true,status:true,price:{$gt:0},active:true},{name:1,slug:1,thumbnail:1,price:1,discount:1,currentStock:1,brand:1,sku:1,images:1}).sort({createdAt:-1}).limit(12)
        let featured = await productModel.find({forOnline:true, featured:true,status:true,price:{$gt:0},active:true},{name:1,slug:1,thumbnail:1,price:1,discount:1,currentStock:1,brand:1,sku:1,images:1}).sort({createdAt:1}).limit(12)
        let newArrival = await productModel.find({forOnline:true, newArrival: true, status:true, price:{$gt:0},active:true},{name:1,slug:1,thumbnail:1,price:1,discount:1,currentStock:1,brand:1,sku:1,images:1}).sort({createdAt:-1}).limit(12)
        let categoryList = []
        category.map((cat)=>{
            let obj = {
                _id: cat._id,
                name : cat.name,
                url : '/category/'+cat._id
            }
            categoryList.push(obj)
        })
        let shop = []
        vendor.map((item)=>{
            shop.push({
                _id : item._id,
                name : item.vendorName,
                image : item.thumbnail
            })
        })
        
        // let featuredProduct=[]
        // featured.map((item)=>{
        //     let img = await brandModel.find(_id:item.brand.)
        // })

        res.status(200).json({
            data : {
                info : data,
                featuredCategory : featuredCategory,
                category : categoryList,
                shop : {
                    title : "Our Shops",
                    items : shop
                },
                brand : {
                    title : "Our Brands",
                    items : brand
                },
                topSelling : {
                    title : "Top Selling Products",
                    items : topSelling
                },
                featured : {
                    title : "Our Products",
                    items : featured
                },
                newArrival : {
                    title : "New Arrivals",
                    items : newArrival
                }
            },
            success: true
        });
    }catch (e) {
        console.log("ERROR:",e);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}


const allShop = async (req,res)=>{
    try{
        console.log("in all shops,,,,,,,")
        let vendor = await vendorModel.find({featured:true,isBlocked:false},{vendorName:1,thumbnail:1,address:1})
        let shop = []
        vendor.map((item)=>{
            console.log(item)
            shop.push({
                _id : item._id,
                name : item.vendorName,
                image : item.thumbnail,
                address : item.address.details
            })
            
        })
        res.status(200).json({
            data : shop,
            success : true
          });
    }catch(err){
        console.log("ERROR:",e);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

module.exports = {
    home,
    allShop
};
