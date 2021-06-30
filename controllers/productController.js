const productModel = require('./../models/product');
const brandModel = require('./../models/brand');
const subsubcategoryModel = require('./../models/subsubcategory');
const categoryModel = require('./../models/category');
const vendorModel = require('./../models/vendor');
const discountModel = require('./../models/discount');
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const fs = require('fs');
const axios = require('axios')
const moment = require('moment-timezone');
const sharp = require('sharp');
const category = require('./../models/category');
const brand = require('./../models/brand');
const nanoid = require('nanoid').nanoid
const generateUniqueId = require('generate-unique-id');
const QRCode = require('qrcode')
const _ = require('lodash');
const sizeOf = require('image-size');
const slug = require('slug');

const projection = {
  buyingPrice: 0,
  createdAt: 0,
  updatedAt: 0,
  __v: 0
}

let productProjection = { name: 1, thumbnail: 1,slug:1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }

const allProduct = async (req, res) => {
  try {
    let data = await productModel.find({ status: true }, { name: 1,slug:1, description: 1, images: 1, thumbnail: 1, stock: 1, brand: 1, category: 1, subcategory: 1, price: 1, sku: 1, discount: 1, forOnline: 1, currentStock: 1, barcode: 1, vat: 1 }).sort({ createdAt: -1 }).limit(10).skip(req.params.page * 10);
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

const createProduct = async (req, res) => {
  try {
    let slugString = slug(req.body.name)
    let check = await productModel.findOne({ slug: slugString })
    if (!check) {
      let id = mongoose.Types.ObjectId();
      req.body._id = id;
      let productCount = await productModel.count();
      let sku = productCount.toString()
      while (sku.length < 5) {
        sku = "0" + sku
      }
      req.body.slug = slugString

      req.body.sku = sku;
      req.body.barcode = 'public/barcode/' + req.body.sku + '.png';
      let url = "https://jmc.shopping/product/"+slugString;
      console.log(url);
      QRCode.toBuffer(url, function (err, qrBuffer) {
        sharp(qrBuffer)
          .rotate()
          .toFile(req.body.barcode, (err, info) => {
            if (err) {
              console.log(err);
            }
          });
      })
      let image = req.body.thumbnail.split(';base64,').pop();
      let path = "public/product/" + id + ".jpg";
      let inputBuffer = Buffer.from(image, 'base64')
      sharp(inputBuffer)
        .resize(200)
        .rotate()
        .toFile(path, (err, info) => {
          if (err) {
            console.log(err);
          }
        })
      ;
      let pathThumbnail = "public/product/" + id + ".jpg";
      sharp(inputBuffer)
        .resize(800)
        .rotate()
        .toFile(pathThumbnail, (err, info) => {
          if (err) {
            console.log(err);
          }
        }
      );
      req.body.thumbnail = pathThumbnail;
      let brandData;
      if (req.body.brand) {
        brandData = await brandModel.findOne({ _id: req.body.brand }, { name: 1, image: 1 })
      }
      let vendor = await vendorModel.findOne({ _id: req.body.vendorId }, { vendorName: 1 })
      let category = await categoryModel.findOne({ _id: req.body.category }, { name: 1, subcategory: 1 })
      let subcategory;
      category.subcategory.map((item) => {
        if (item._id == req.body.subcategory) {
          subcategory = item.name;
        }
      })
      req.body.vendorName = vendor.vendorName;
      req.body.category = {
        name: category.name,
        _id: category._id
      };
      req.body.subcategory = {
        name: subcategory,
        _id: req.body.subcategory
      };
      req.body.images = [path]
      if (req.body.subsubcategory) {
        let subsubcategory = await subsubcategoryModel.findOne({ _id: req.body.subsubcategory }, { name: 1 })
        req.body.subsubcategory = {
          name: subsubcategory.name,
          _id: req.body.subsubcategory
        };
      }
      req.body.brand = brandData
      let data = await productModel.create(req.body);
      if (data) {
        res.status(201).json({
          data: data,
          message: "Product created successfully.",
          success: true
        });
      }
      else {
        res.status(409).json({
          data: null,
          message: "Product could not be created.",
          success: false
        });
      }
    }else{
      res.status(409).json({
        data: null,
        message: "Please use a different name.",
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

const deleteProduct = async (req, res) => {
  try {
    let product = await productModel.findOne({ _id: req.params.id })
    if (product.active && req.user.role == "vendor") {
      return res.status(202).json({
        success: true,
        message: "Product deleted successfully"
      });
    }
    let remove = await productModel.updateOne({ _id: req.params.id }, { $set: { status: false } })
    if (remove) {
      res.status(202).json({
        success: true,
        message: "Product deleted successfully"
      });
    }
    else {
      res.status(409).json({
        success: false,
        message: "Couldn't delete Product."
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

const updateProduct = async (req, res) => {
  try {
    let path = "public/product/" + req.body._id + "_1.jpg";
    let pathThumbnail = "public/product/" + req.body._id + ".jpg";
    if (req.body.thumbnail) {
      let image = req.body.thumbnail.split(';base64,').pop();
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
        .resize(800)
        .rotate()
        .toFile(path, (err, info) => {
          if (err) {
            console.log(err);
          }
        });
      req.body.thumbnail = pathThumbnail;
    }
    let brandData;
    if (req.body.brand) {
      brandData = await brandModel.findOne({ _id: req.body.brand }, { name: 1, image: 1})
    }
    let category = await categoryModel.findOne({ _id: req.body.category }, { name: 1, subcategory: 1 })
    let subcategory;
    category.subcategory.map((item) => {
      if (item._id == req.body.subcategory) {
        subcategory = item.name;
      }
    })
    req.body.category = {
      name: category.name,
      _id: category._id
    };
    
    req.body.subcategory = {
      name: subcategory,
      _id: req.body.subcategory
    };
    req.body.brand = brandData
    let update = await productModel.updateOne({ _id: req.body._id }, { $set: req.body});
    let data = await productModel.findOne({ _id: req.body._id })
    if (update) {
      res.status(201).json({
        data: data,
        message: "Product updated successfully.",
        success: true
      });
    }
    else {
      res.status(409).json({
        message: "Product could not be updated.",
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

const allImage = async (req, res) => {
  try {
    let product = await productModel.findOne({ _id: req.body._id }, { images: 1 });
    if (product) {
      res.status(201).json({
        data: product.images,
        success: true
      });
    }
    else {
      res.status(409).json({
        data: null,
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

const addImage = async (req, res) => {
  try {
    let imageName = nanoid(7);
    let path = "public/product/" + imageName + ".png";
    let data = await productModel.updateOne({ _id: req.body._id }, { $push: { images: path } });
    let product = await productModel.findOne({ _id: req.body._id }, { images: 1 });
    let image = req.body.image.split(';base64,').pop();
    let dimensions = sizeOf(Buffer.from(image, 'base64'));
    if (dimensions.width > dimensions.height) {
      sharp(Buffer.from(image, 'base64'))
        .resize(600, 600, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .rotate()
        .toFile(path, (err, info) => {
          if (err) {
            console.log(err);
            res.status(409).json({
              data: err,
              message: "Image could not be added.",
              success: false
            });
          } else {
            res.status(201).json({
              data: product.images,
              message: "Image added successfully.",
              success: true
            });
          }
        });
    } else {
      sharp(Buffer.from(image, 'base64'))
        .resize(600)
        .rotate()
        .toFile(path, (err, info) => {
          if (err) {
            console.log(err);
            res.status(409).json({
              data: err,
              message: "Image could not be added.",
              success: false
            });
          } else {
            res.status(201).json({
              data: product.images,
              message: "Image added successfully.",
              success: true
            });
          }
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

const removeImage = async (req, res) => {
  try {
    let data = await productModel.updateOne({ _id: req.body._id }, { $pull: { images: req.body.image } });
    if (data) {
      res.status(201).json({
        message: "Image removed successfully.",
        success: true
      });
    }
    else {
      res.status(409).json({
        message: "Image could not be removed.",
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

const allProductByVendor = async (req, res) => {
  try {
    let data = await productModel.find({ status: true, vendorId: req.params.vendorId }, projection).sort({ createdAt: -1 });
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

const allProductForAgent = async (req, res) => {
  try {
    let data = await productModel.find({ status: true, forAgent: true }, projection).sort({ createdAt: -1 });
    res.status(200).json({
      data: data,
      success: true
    });
  } catch (err) {
    res.status(500).json({
      data: err,
      success: false,
      message: "Internal Server Error Occurred."
    });
  }
}

const viewProduct = async (req, res) => {
  try {
    let data = await productModel.findOne({ _id: req.params.id }, projection)
    if (!data.sizes || data.sizes.length == 0) {
      data.sizes = [{
        size : 'Free size',
        stock : 0
      }]
    }
    let orQuery = [{ "category._id": data.category._id }]
    if (data.subcategory) {
      orQuery.push({ "subcategory._id": data.subcategory._id })
    }
    let similerProducts = await productModel.find({ forOnline: true, featured: true, status: true, price: { $gt: 0 }, active: true, $or: orQuery }, { name: 1, slug:1, thumbnail: 1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }).sort({ createdAt: -1 }).limit(20)
    res.status(200).json({
      data: data,
      similerProducts: similerProducts,
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

const viewProductSlug = async (req, res) => {
  try {
    let data = await productModel.findOne({ slug: req.params.slug}, projection)
    if (!data.sizes || data.sizes.length == 0) {
      data.sizes = [{
        size : 'Free size',
        stock : 0
      }]
    }
    let orQuery = [{ "category._id": data.category._id }]
    if (data.subcategory) {
      orQuery.push({ "subcategory._id": data.subcategory._id })
    }
    let similerProducts = await productModel.find({ forOnline: true, featured: true, status: true, price: { $gt: 0 }, active: true, $or: orQuery }, { name: 1, slug:1, thumbnail: 1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }).sort({ createdAt: -1 }).limit(20)
    res.status(200).json({
      data: data,
      similerProducts: similerProducts,
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

const productPreset = async (req, res) => {
  try {
    let category = await categoryModel.find({ status: true }, projection)
    let subsubcategory = await subsubcategoryModel.find({}, projection)
    let categoryData = [];
    category.map((cat) => {
      let subcat = []
      cat.subcategory.map((sub) => {
        let subsubcat = []
        subsubcategory.map((item) => {
          if (item.subcategory._id == sub._id) {
            subsubcat.push({
              _id: item._id,
              name: item.name,
              image: item.image
            })
          }
        })
        subcat.push({
          _id: sub._id,
          name: sub.name,
          image: sub.image,
          subsubcategory: subsubcat
        })
      })
      categoryData.push({
        _id: cat._id,
        name: cat.name,
        image: cat.image,
        subcategory: subcat
      })
    })
    let brand = await brandModel.find({}, projection)
    res.status(200).json({
      data: {
        category: categoryData,
        brand: brand
      },
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

const search = async (req, res) => {
  try {
    let product = await productModel.fuzzySearch(req.params.char, { forOnline: true, active: true, status: true, price: { $gt: 0 } }).limit(10)
    let regex = new RegExp(req.params.char, "i")
    let category = await categoryModel.find({ name: { "$regex": regex } }, { name: 1 }).limit(5)
    let vendor = await vendorModel.find({ vendorName: { "$regex": regex } }, { vendorName: 1 }).limit(5)
    let data = product.map((item) => {
      return {
        _id: item._id,
        name: item.name,
        price: item.price,
        slug: item.slug
      }
    })
    res.status(200).json({
      data: {
        products: data,
        category: category,
        shop: vendor
      },
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

const productByCategory = async (req, res) => {
  try {
    let skip = 0
    let limit = 60
    if (req.query.limit) {
      limit = Number(req.query.limit)
    }
    if (req.query.page) {
      skip = Number((req.query.page-1) * limit)
    }
    let category = await categoryModel.findOne({ _id: req.params.id }, { subcategory: 1, name: 1, slug:1 })
    let product = await productModel.find({ status: true, forOnline: true, active: true, price: { $gt: 0 }, "category._id": category._id }, { name: 1,slug:1, thumbnail: 1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }).limit(60).sort({ createdAt: -1 }).skip(skip).limit(limit)
    res.status(200).json({
      data: {
        product: product,
        links: [{
          title: 'Home',
          url: '/'
        }, {
          title: category.name,
          url: '/category/' + category._id.toString()
        }],
        subcategory: category.subcategory,
        category: category
      },
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

const productBySubcategory = async (req, res) => {
  try {
    let skip = 0
    let limit = 20
    if (req.query.limit) {
      limit = req.query.limit
    }
    if (req.query.page) {
      skip = (req.query.page-1) * limit
    }
    let category = await categoryModel.findOne({"subcategory._id": req.params.id}, { name: 1, subcategory: 1, slug: 1 })
    let subcategory;
    category.subcategory.map((item) => {
      if (item._id == req.params.id) {
        subcategory = {
          _id: item._id,
          name: item.name,
          slug: item.slug
        }
      }
    })
    let product = await productModel.find({ status: true, forOnline: true, active: true, price: { $gt: 0 }, "subcategory._id": subcategory._id }, { name: 1, slug:1, thumbnail: 1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }).limit(60).sort({ createdAt: -1 }).skip(skip).limit(limit)
    let subsubcategory = await subsubcategoryModel.find({ "subcategory._id": subcategory._id }, { name: 1, image: 1, slug: 1 })
    res.status(200).json({
      data: {
        product: product,
        links: [{
          title: 'Home',
          url: '/'
        }, {
          title: category.name,
          url: '/category/' + category._id.toString()
        }, {
          title: subcategory.name,
          url: '/subcategory/' + subcategory._id.toString()
        }],
        subcategory: subcategory,
        subsubcategory: subsubcategory
      },
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

const productBySubsubcategory = async (req, res) => {
  try {
    let skip = 0
    let limit = 20
    if (req.query.limit) {
      limit = req.query.limit
    }
    if (req.query.page) {
      skip = (req.query.page-1) * limit
    }
    let subsubcategory = await subsubcategoryModel.findOne({ _id: req.params.id }, { subcategory: 1, name: 1,slug:1 })
    let category = await categoryModel.findOne({ "subcategory._id": subsubcategory.subcategory._id }, { name: 1,slug:1 })
    let product = await productModel.find({ status: true, forOnline: true, active: true, price: { $gt: 0 }, "subsubcategory._id": subsubcategory._id }, { name: 1,slug:1, thumbnail: 1, price: 1, discount: 1, currentStock: 1, brand: 1, sku: 1, images: 1 }).limit(60).sort({ createdAt: -1 }).skip(skip).limit(limit)
    res.status(200).json({
      data: {
        product: product,
        links: [{
          title: 'Home',
          url: '/'
        }, {
          title: category.name,
          url: '/category/' + category._id.toString()
        }, {
          title: subsubcategory.subcategory.name,
          url: '/subcategory/' + subsubcategory.subcategory._id.toString()
        }, {
          title: subsubcategory.name,
          url: '/subsubcategory/' + subsubcategory._id.toString()
        }],
        subsubcategory: {
          _id: subsubcategory._id,
          name: subsubcategory.name
        }
      },
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

const productByBrand = async (req, res) => {
  try {
    let skip = 0
    let limit = 20
    if (req.query.limit) {
      limit = req.query.limit
    }
    if (req.query.page) {
      skip = (req.query.page-1) * limit
    }
    let brand = await brandModel.findOne({_id:req.params.id})
    let product = await productModel.find({ status: true, forOnline: true, active: true, price: { $gt: 0 }, "brand._id": brand._id }, projection).limit(60).sort({ createdAt: -1 }).skip(skip).limit(limit)
    res.status(200).json({
      data: {
        product: product
      },
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

const productBySKU = async (req, res) => {
  try {
    let product = await productModel.findOne({ "sku": req.params.sku }, projection)
    res.status(200).json({
      data: product,
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

const productByVendor = async (req, res) => {
  try {
    let skip = 0
    let limit = 20
    if (req.query.limit) {
      limit = req.query.limit
    }
    if (req.query.page) {
      skip = (req.query.page-1) * limit
    }
    let shop = await vendorModel.findOne({_id: req.params.vendorId }, { vendorName: 1, address: 1, thumbnail: 1, slug: 1 })
    let data = await productModel.find({ status: true, vendorId: shop._id }, projection).skip(skip).limit(limit);
    res.status(200).json({
      data: {
        product: data,
        shop: shop
      },
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

const updateDiscount = async (req, res) => {
  try {
    let product = await productModel.updateOne({ _id: req.body._id }, { $set: { discount: req.body.discount } })
    res.status(200).json({
      success: true,
      message: 'Discount updated!'
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

const unapprovedPorducts = async (req, res) => {
  try {
    let data = await productModel.find({ active: false })
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

const approveProduct = async (req, res) => {
  try {
    await productModel.updateOne({ _id: req.params.id }, { $set: { active: true } })
    res.status(200).json({
      success: true,
      message: "Product approved!"
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

const findProducts = async (req, res) => {
  try {
    let obj = { status: true, price: { "$gte": 10 }, forOnline: true, price: { $gt: 0 } }
    if (req.body) {
      if (req.body.lowPrice) {
        obj["price"]["$gte"] = parseInt(req.body.lowPrice)
      }
      if (req.body.highPrice) {
        obj["price"]["$lte"] = parseInt(req.body.highPrice)
      }
      if (req.body.category && req.body.category.length) {
        obj["category._id"] = { "$in": req.body.category }
      }
      if (req.body.brand && req.body.brand.length) {
        obj["brand._id"] = { "$in": req.body.brand }
      }
      if (req.body.availability) {
        obj["currentStock"] = { "$gt": 0 }
      }
      if (req.body.discount) {
        obj["discount.amount"] = { "$gt": 0 }
      }
    }
    let product = await productModel.fuzzySearch(req.params.char, obj).limit(100)
    let category = await categoryModel.find({ status: true }, { name: 1 });
    let brand = await brandModel.find({}, { name: 1 })
    let price;
    let low = 0;
    let high = 100;
    if (product.length) {
      low = product[0].price,
        high = product[0].price
    }
    let data = product.map((item) => {
      if (item.price > high) {
        high = item.price
      }
      if (item.price < low) {
        low = item.price
      }
      return {
        _id: item._id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        thumbnail: item.thumbnail,
        discount: item.discount,
        currentStock: item.currentStock,
        brand: item.brand,
        sku: item.sku,
        images: item.images
      }
    })
    if (low == high) {
      low = 0;
    }
    if (req.body.lowPrice && req.body.highPrice) {
      low = req.body.lowPrice;
      high = req.body.highPrice
    }
    res.status(200).json({
      data: {
        product: data,
        category: category,
        brand: brand,
        price: [low, high]
      },
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

const bulkDiscount = async (req, res) => {
  try {
    await discountModel.create(req.body)
    if (req.body.method == "category") {
      await productModel.updateMany({ "category._id": req.body.id }, { $set: { discount: req.body.discount } })
    } else if (req.body.method == "subcategory") {
      await productModel.updateMany({ "subcategory._id": req.body.id }, { $set: { discount: req.body.discount } })
    } else if (req.body.method == "vendor") {
      await productModel.updateMany({ "vendorId": req.body.id }, { $set: { discount: req.body.discount } })
    }
    res.status(200).json({
      success: true,
      message: 'Discount created successfully!'
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

const allBulkDiscount = async (req, res) => {
  try {
    let data = await discountModel.find()
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

const removeBulkDiscount = async (req, res) => {
  try {
    let data = await discountModel.deleteOne({ _id: req.params.id })
    res.status(200).json({
      data: data,
      success: true,
      message: 'Discount deleted successfully!'
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
  allProduct,
  createProduct,
  deleteProduct,
  updateProduct,
  addImage,
  removeImage,
  allProductByVendor,
  allProductForAgent,
  viewProduct,
  viewProductSlug,
  productPreset,
  unapprovedPorducts,
  approveProduct,
  search,
  productByCategory,
  productBySubcategory,
  productByBrand,
  productBySubsubcategory,
  allImage,
  productBySKU,
  updateDiscount,
  productByVendor,
  findProducts,
  bulkDiscount,
  allBulkDiscount,
  removeBulkDiscount
};
