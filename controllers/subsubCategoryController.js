const categoryModel = require('../models/category');
const subsubcategoryModel = require('../models/subsubcategory');

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const category = require('../models/category');
const slug = require('slug')

const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const allSubsubCategory = async (req,res) => {
    try{
        let sub = await subsubcategoryModel.find({},projection);
        res.status(200).json({
          data : sub,
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

const createSubsubCategory = async (req,res) => {
    try {
        let id = mongoose.Types.ObjectId();
        let path = "public/subsubcategory/"+id+".jpg";
        let path_large = "public/subsubcategory/"+id+"_1.jpg";
        let slugString = slug(req.body.name)
        let subcategoryData = await categoryModel.findOne({"subcategory._id":req.body.subcategoryId},{subcategory:1})
        let subcategory;
        subcategoryData.subcategory.map((item)=>{
          if (item._id == req.body.subcategoryId) {
            subcategory = item;
          }
        })
        let body = {
          _id : id,
          name : req.body.name,
          image : path,
          image_large: path_large,
          subcategory : {
            _id : subcategory._id,
            name : subcategory.name,
            slug: subcategory.slug
          },
          slug : slugString
        }
        if (req.body.image) {
          let image = req.body.image.split(';base64,').pop();
          let inputBuffer = Buffer.from(image, 'base64')
          sharp(inputBuffer)
            .resize(200)
            .rotate()
            .toFile(path, (err, info) => {
              if (err) {
                console.log(err)
              }
            });

          sharp(inputBuffer)
            .resize(600)
            .rotate()
            .toFile(path_large, (err, info) => {
              if (err) {
                console.log(err)
              }
            });
        }
        let create = await subsubcategoryModel.create(body);
        if(create){
            res.status(201).json({
                data : create,
                message : "Sub-category created successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Sub-category could not be created.",
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

const deleteSubsubCategory = async (req,res) => {
    try{
        //let remove = await subsubcategoryModel.deleteOne({_id:req.params.id})
        let remove = await subsubcategoryModel.findOneAndRemove({ _id: req.params.id }, { $set: { status: false }})
        
        if(remove){
            console.log(remove);
            res.status(202).json({
                success : true,
                message : "Sub-category deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success : false,
                message : "Couldn't delete Sub-category."
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

const updateSubsubCategory = async (req,res) => {
    try {
        let update = await subsubcategoryModel.updateOne({_id:req.body._id},{$set:{"name":req.body.name}});
        let data = await subsubcategoryModel.findOne({_id:req.body._id},projection);
        let path = "public/subsubcategory/"+req.body._id+".jpg";
        let path_large = "public/subsubcategory/"+req.body._id+"_1.jpg";
        if (req.body.image) {
          let image = req.body.image.split(';base64,').pop();
          let inputBuffer = Buffer.from(image, 'base64')
          sharp(inputBuffer)
            .resize(200)
            .rotate()
            .toFile(path, (err, info) => {
              if (err) {
                console.log(err);
              }
            });

          sharp(inputBuffer)
            .resize(600)
            .rotate()
            .toFile(path_large, (err, info) => {
              if (err) {
                console.log(err);
              }
            });
        }
        if(data){
            res.status(201).json({
                data : data,
                message : "Sub-category updated successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Sub-category could not be updated.",
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

module.exports =  {
    allSubsubCategory,
    createSubsubCategory,
    deleteSubsubCategory,
    updateSubsubCategory
};
