const brandModel = require('./../models/brand');
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

const allBrand = async (req,res) => {
    try{
        let data = await brandModel.find({},projection).sort({createdAt:-1});
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

const createBrand = async (req,res) => {
    try {
        let check = await brandModel.findOne({name:req.body.name})
        if (!check) {
          let id = mongoose.Types.ObjectId();
          req.body._id = id;
          req.body.slug = slug(req.body.name)
          let image = req.body.image.split(';base64,').pop();
          let path = "public/brand/"+id+".jpg";
          let inputBuffer = Buffer.from(image, 'base64')
          sharp(inputBuffer)
            .resize(200)
            .rotate()
            .toFile(path, (err, info) => {
              if (err) {
                console.log(err);
              }
            });
          req.body.image = path;
          let path_large = "public/brand/"+id+"_1.jpg";
          sharp(inputBuffer)
            .resize(600)
            .rotate()
            .toFile(path_large, (err, info) => {
              if (err) {
                console.log(err);
              }
            });
          req.body.image_large = path_large;
          let data = await brandModel.create(req.body);
          if(data){
              let obj = {
                _id : id,
                name : req.body.name,
                description : req.body.description,
                image : path,
                active: req.body.active,
                slug : slug(req.body.name)
              }
              res.status(201).json({
                  data : obj,
                  message : "Brand created successfully.",
                  success : true
              });
          }
          else {
              res.status(409).json({
                message : "Brand could not be created.",
                success : false
              });
          }
        }else {
          res.status(409).json({
            message : "Brand already exists.",
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

const deleteBrand = async (req,res) => {
    try{
        let remove = await brandModel.deleteOne({_id : req.params.id})
        if(remove){
            res.status(202).json({
                success : true,
                message : "Brand deleted successfully"
            });
        }
        else {
            res.status(409).json({
                success : false,
                message : "Couldn't delete Brand."
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

const updateBrand = async (req,res) => {
    try {
        let path = "public/brand/"+req.body._id+".jpg";
        let path_large = "public/brand/"+req.body._id+"_1.jpg";
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
        let data = await brandModel.updateOne({_id:req.body._id},{$set:{name:req.body.name,description:req.body.description,featured:req.body.featured,active:req.body.active}});
        if(data){
            let obj = {
              _id : req.body._id,
              name : req.body.name,
              active: req.body.active,
              description : req.body.description,
              image : path
            }
            res.status(201).json({
                data : obj,
                message : "Brand updated successfully.",
                success : true
            });
        }
        else {
            res.status(409).json({
              message : "Brand could not be updated.",
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
    allBrand,
    createBrand,
    deleteBrand,
    updateBrand
};
