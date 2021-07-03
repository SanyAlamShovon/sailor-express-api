const campaignModel = require('../models/campaign');
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
const brand = require('../models/brand');
const nanoid = require('nanoid').nanoid
const generateUniqueId = require('generate-unique-id');
const QRCode = require('qrcode')
const _ = require('lodash');
const sizeOf = require('image-size');
const slug = require('slug');

const projection = {
  createdAt: 0,
  updatedAt: 0,
  __v: 0
}

const allCampaign = async (req, res) => {
  try {
    let data = await campaignModel.find({status:true},projection).sort({createdAt:-1});
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

const createCampaign = async (req, res) => {
  try {
      let check = await campaignModel.findOne({ metaTitle: req.body.metaTitle })
      if (!check) {
        let id = mongoose.Types.ObjectId();
        let banner = req.body.banner.split(';base64,').pop();
        let featuredPath = "public/campaign/featured/" + id + ".jpg";
        let inputBuffer = Buffer.from(banner, 'base64')
        sharp(inputBuffer)
          .resize(200,200)
          .rotate()
          .toFile(featuredPath, (err, info) => {
            if (err) {
              console.log(err);
            }
            console.log(info)
          });
        let path = "public/campaign/" + id + ".jpg";
        sharp(inputBuffer)
          .resize(800)
          .rotate()
          .toFile(path, (err, info) => {
            if (err) {
              console.log(err);
            }
            console.log(info)
          }
        );
        req.body.banner = path;
        req.body.featuredImage = featuredPath;


        let campaign = await campaignModel.create(req.body);
        if (campaign) {
            res.status(201).json({
                data: campaign,
                message: "Campaign created successfully.",
                success: true
            });
        }
        else {
            res.status(409).json({
                data: "Failed to create campaign",
                success: false
            });
        }
      } else {
          res.status(409).json({
              message: "Campaign already exists.",
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

const viewCampaigntSlug = async (req, res) => {
  try {
    let data = await campaignModel.findOne({ slug: req.params.slug}, projection)
    
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

const deleteCampaign = async (req,res) => {
  try{
      let remove = await campaignModel.updateOne({_id : req.params.id},{$set:{status:false}})
      if(remove){
          res.status(202).json({
              success : true,
              message : "Campaign deleted successfully"
          });
      }else {
          res.status(409).json({
              success : false,
              message : "Couldn't delete campaign."
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



module.exports = {
  createCampaign,
  allCampaign,
  viewCampaigntSlug,
  deleteCampaign
};
