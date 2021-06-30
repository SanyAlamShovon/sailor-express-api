const promoModel = require('./../models/promo');

const mongoose = require('mongoose');
const sharp = require('sharp');

const projection = {
  createdAt: 0,
  updatedAt: 0,
  __v: 0
}

const allPromo = async (req, res) => {
  try {
    let data = await promoModel.find();
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

const create = async (req, res) => {
  try {
    let data = await promoModel.create(req.body);
    res.status(201).json({
      data: data,
      message: "Promo created successfully.",
      success: true
    })
  } catch (err) {
    res.status(500).json({
      data: null,
      success: false,
      message: "Internal Server Error Occurred."
    });
  }
}

const remove = async (req, res) => {
  try {
    await promoModel.deleteOne({ code: req.params.code })
    res.status(202).json({
      success: true,
      message: "Promo deleted successfully"
    });
  } catch (err) {
    console.log("ERROR:", err);
    res.status(500).json({
      data: null,
      success: false,
      message: "Internal Server Error Occurred."
    });
  }
}

const verify = async (req, res) => {
  try {
    console.log(req.params.code);
    let data = await promoModel.findOne({code:req.params.code,validity:{$gte:new Date()}});
    if (data) {
      res.status(200).json({
        data: {
          code : data.code,
          discount: data.discount
        },
        success: true,
        message : "Promo code added successfylly"
      });
    }else{
      res.status(200).json({
        data: null,
        success: false,
        message : "Promo code is not valid"
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

module.exports = {
  allPromo,
  create,
  remove,
  verify
};
