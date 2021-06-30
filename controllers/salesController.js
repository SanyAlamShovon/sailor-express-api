const orderModel = require('../models/order');
const salesModel = require('./../models/sale');
const vendorModel = require('./../models/vendor');
const supplierModel = require('./../models/supplier');
const inventoryModel = require('./../models/inventory');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const inventory = require('../models/inventory');
const  _ = require('lodash');
const Excel = require('exceljs')

const projection = {
    updatedAt: 0,
    __v: 0
}

const allSales = async (req,res) => {
    try{
        let startDate = moment().subtract(1,'month').format()
        let endDate = moment().format()
        if ( req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        let data;
        let allFil = {"createdAt":{"$gte":startDate,"$lte":endDate}}
        let vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate}}
        if (req.body.salesType == 0) {
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:0}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:0}
        }
        else if (req.body.salesType == 1) {
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:1}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:1}
        }else if(req.body.salesType == 2){
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:2}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:2}
        }
        if (!req.body.vendorId) {
            data = await salesModel.find(allFil,projection);
        }else{
            data = await salesModel.find(vendorFil,projection);
        }
        res.status(200).json({
            data : {
                sales : data
            },
            success : true
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}


const allSalesDownload = async (req,res) => {
    try{
        let startDate = moment().subtract(1,'month').format()
        let endDate = moment().format()
        if ( req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        let data;
        let allFil = {"createdAt":{"$gte":startDate,"$lte":endDate}}
        let vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate}}
        if (req.body.salesType == 0) {
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:0}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:0}
        }
        else if (req.body.salesType == 1) {
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:1}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:1}
        }else if(req.body.salesType == 2){
            allFil = {"createdAt":{"$gte":startDate,"$lte":endDate},salesType:2}
            vendorFil = {"vendor._id":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate},salesType:2}
        }
        if (!req.body.vendorId) {
            data = await salesModel.find(allFil,projection);
        }else{
            data = await salesModel.find(vendorFil,projection);
        }

        let workbook = new Excel.Workbook()
        let worksheet = workbook.addWorksheet('Sales')
        worksheet.columns = [
            {header: 'Date', key: 'createdAt'},
            {header: 'Product', key: 'product.name'},
            {header: 'Price', key: 'product.price'},
            {header: 'Quantity', key: 'product.quantity'},
            {header: 'Discount', key: 'product.discount'},
            {header: 'Vat', key: 'product.vat'},
            {header: 'Vendor', key: 'vendor.name'},
            {header: 'Vendor Share', key: 'vendorShare'}
          ]
        worksheet.getRow(1).font = {bold: true}
        
        data.forEach((e, index) => {
            const rowIndex = index + 2
            worksheet.addRow({
              ...e,
            //   amountRemaining: {
            //     formula: `=C${rowIndex}-D${rowIndex}`
            //   },
            //   percentRemaining: {
            //     formula: `=E${rowIndex}/C${rowIndex}`
            //   }
            })
          })
        await workbook.xlsx.writeFile('sales.xlsx')
        res.download('sales.xlsx')
    }catch(err){
        console.log(err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const salesByVendor = async (req,res) => {
    try{
        let startDate = moment().subtract(1,'month').format()
        let endDate = moment().format()
        if ( req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        let data = await salesModel.find({"vendor._id":req.body.vendorId,createdAt:{$gte:startDate,$lte:endDate}},projection).sort({createdAt:-1});
        let vendor = await vendorModel.findOne({_id:req.body.vendorId},{balance:1})
        res.status(200).json({
            data : {
                sales : data,
                balance : vendor.balance
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

const salesChart = async (req,res) => {
    try{
        let sales = await salesModel.aggregate(
            [
                {
                    $group:
                    {
                        _id: {
                            day: { $dayOfYear: "$createdAt" },
                            salesPrice: { $sum: "$product.price" },
                            buyingPrice: { $sum: "$buyingPrice" }
                        }
                    }
                }
            ]
        )
        let data = [['Date', 'Sale Price', 'Buy Price', 'Profit']];
        sales =  _.orderBy(sales, ['_id.day'],['asc']);
        sales.map((item,index)=>{
            let d = new Date();
            var temp =  d.getFullYear()+'-01-01';
            console.log(item._id.day-1);
            let date =  moment(temp).add(item._id.day-1,'days').format('DD MMM')
            data.push([date,item._id.salesPrice,item._id.buyingPrice,item._id.salesPrice-item._id.buyingPrice])
        })
        res.status(200).json({
            data : data,
            success : true
        });
    }catch(err){
        console.log(err);
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

const allPurchase = async (req,res) => {
    try{
        let startDate = moment().subtract(1,'month').format()
        let endDate = moment().format()
        if ( req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        let filter
        if (req.body.vendorId) {
            filter = {"vendorId":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate}}
        }else{
            filter = {"createdAt":{"$gte":startDate,"$lte":endDate}}
        }
        let data = await inventoryModel.find(filter,projection).sort({createdAt:-1});
        res.status(200).json({
            data : {
                sales : data
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


const allPurchaseDownload = async (req,res) => {
    try{
        let startDate = moment().subtract(1,'month').format()
        let endDate = moment().format()
        if ( req.body.startDate && req.body.endDate) {
            startDate = moment(req.body.startDate).format()
            endDate = moment(req.body.endDate).format()
        }
        let filter
        if (req.body.vendorId) {
            filter = {"vendorId":req.body.vendorId,"createdAt":{"$gte":startDate,"$lte":endDate}}
        }else{
            filter = {"createdAt":{"$gte":startDate,"$lte":endDate}}
        }
        let data = await inventoryModel.find(filter,projection).sort({createdAt:-1});
        res.status(200).json({
            data : {
                sales : data
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

module.exports =  {
    allSales,
    salesByVendor,
    allPurchase,
    salesChart,
    allSalesDownload,
    allPurchaseDownload
};
