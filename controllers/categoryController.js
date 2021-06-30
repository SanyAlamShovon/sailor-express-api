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

const allCategory = async (req,res) => {
    try{
        let data = await categoryModel.find({status:true},projection).sort({createdAt:-1});
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

const createCategory = async (req,res) => {
    try {
        let id = mongoose.Types.ObjectId();
        req.body._id = id;
        req.body.slug = slug(req.body.name)
        console.log(req.body.slug);
        let path = "public/category/"+id+".jpg";
        let path_large = "public/category/"+id+"_1.jpg";
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
          req.body.image = path;
          req.body.image_large = path_large
        }
        let data = await categoryModel.create(req.body);
        if(data){
            let obj = {
              _id : id,
              name : req.body.name,
              image : path,
              featured : req.body.featured,
              active: req.body.active,
              slug : req.body.split
            }
            res.status(201).json({
                data : obj,
                message : "Category created successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Category could not be created.",
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

const deleteCategory = async (req,res) => {
    try{
        let remove = await categoryModel.updateOne({_id : req.params.id},{$set:{status:false}})
        if(remove){
            res.status(202).json({
                success : true,
                message : "Category deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success : false,
                message : "Couldn't delete category."
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

const updateCategory = async (req,res) => {
    try {
        let data = await categoryModel.updateOne({_id:req.body._id},{$set:{name:req.body.name,featured:req.body.featured,active:req.body.active}});
        let path = "public/category/"+req.body._id+".jpg";
        let path_large = "public/category/"+req.body._id+"_1.jpg";

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
            let obj = {
              _id : req.body._id,
              name : req.body.name,
              image : path,
              active: req.body.active,
              featured : req.body.featured
            }
            res.status(201).json({
                data : obj,
                message : "Category updated successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Category could not be updated.",
              success : false
            });
        }
    }catch(err){
        res.status(500).json({
          data : null,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}

module.exports =  {
    allCategory,
    createCategory,
    deleteCategory,
    updateCategory
};
