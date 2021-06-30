const categoryModel = require('./../models/category');

const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const slug = require('slug')

const projection = {
    createdAt: 0,
    updatedAt: 0,
    __v: 0
}

const allSubCategory = async (req,res) => {
    try{
        let sub = await categoryModel.find({},projection);
        let data = [];
        sub.map((item)=>{
          item.subcategory.map((it)=>{
            data.push({
              _id : it._id,
              name : it.name,
              active: it.active,
              image : it.image,
              category : {
                _id : item._id,
                name : item.name
              }
            })
          })
        })
        res.status(200).json({
          data : data,
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

const createSubCategory = async (req,res) => {
    try {
        let id = mongoose.Types.ObjectId();
        let path = "public/subcategory/"+id+".jpg";
        let path_large = "public/subcategory/"+id+"_1.jpg";
        let body = {
          _id : id,
          name : req.body.name,
          image : path,
          image_large: path_large,
          active: req.body.active,
          slug : slug(req.body.name)
        }
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
        let create = await categoryModel.updateOne({_id:req.body.categoryId},{$push:{subcategory:body}});
        let category = await categoryModel.findOne({_id:req.body.categoryId},{name:1});
        let obj = {
          _id : id,
          name : req.body.name,
          image : path,
          active: req.body.active,
          category : {
            _id : category._id,
            name : category.name
          },
          slug : slug(req.body.name)
        }
        if(create){
            res.status(201).json({
                data : obj,
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

const deleteSubCategory = async (req,res) => {
    try{
        let remove = await categoryModel.updateOne({"subcategory._id":req.params.id},{$pull:{subcategory:{_id:req.params.id}}})
        if(remove){
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

const updateSubCategory = async (req,res) => {
    try {
        console.log(req.body);
        let update = await categoryModel.updateOne({"subcategory._id":req.body._id},{$set:{"subcategory.$.name":req.body.name}});
        let data = await categoryModel.findOne({"subcategory._id":req.body._id},{name:1});
        let path = "public/subcategory/"+req.body._id+".jpg";
        let path_large = "public/subcategory/"+req.body._id+"_1.jpg";
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
        let obj = {
          _id : req.body._id,
          name : req.body.name,
          image : path,
          active: req.body.active,
          category : {
            _id : data._id,
            name : data.name
          }
        }
        if(data){
            res.status(201).json({
                data : obj,
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
    allSubCategory,
    createSubCategory,
    deleteSubCategory,
    updateSubCategory
};
