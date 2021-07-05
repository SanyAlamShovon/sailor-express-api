const orderModel = require('./../models/order');
const emiModel = require('./../models/emi');
const adminModel = require('./../models/admin');
const agentModel = require('./../models/agent');
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
const Excel = require('exceljs');
const { agent } = require('../routes');
const { emi } = require('./agentController');

const locationData = require('../data/locations.json');
const { EMLINK } = require('constants');

const projection = {
    updatedAt: 0,
    __v: 0
}

const agentReport = async (req,res) => {
    try{
        
        // let startDate = moment().subtract(1,'month').format()
        // let endDate = moment().format()
        // if ( req.body.startDate && req.body.endDate) {
        //     startDate = moment(req.body.startDate).format()
        //     endDate = moment(req.body.endDate).format()
        // }

        let agent = await agentModel.findOne(
            {
                "_id":req.params.id,
                "role": "agent"
            },projection);
        
        let emis = await emiModel.find({"agentId":agent._id});
        let instalment=0;
        let total_orderDue=0;
        let orders = await orderModel.find({"customer._id":agent._id});

        for(let index in orders){
            total_orderDue += orders[index].orderDue;
            instalment += orders[index].monthlyEmi;
        }

        let payable = (instalment*0.6).toFixed(2);

        let report = {
            _id : agent._id,
            agentCode : agent.agentCode,
            agentId : agent.agentId,
            name : agent.name,
            phone: agent.phone,
            division: agent.division,
            district : agent.district,
            upazila: agent.upazila,
            incharge_dis: agent.district_incharge,
            incharge_div: agent.division_incharge,
            balance: agent.balance,
            due: total_orderDue,
            next_instalment:instalment,
            payable_instalment: payable,
            deposit_history: agent.cash_in,
            commission: agent.cash_back,
            emi_history: emis,
            order_history: orders,
        }

        res.status(200).json({
            data : report,
            success : true
        });
    }catch(err){
        console.log(err)
        res.status(500).json({
          data : err,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}


const inchargeReport = async (req,res) => {
    try{
        // let startDate = moment().subtract(1,'month').format()
        // let endDate = moment().format()
        // if ( req.body.startDate && req.body.endDate) {
        //     startDate = moment(req.body.startDate).format()
        //     endDate = moment(req.body.endDate).format()
        // }
        let incharge = await adminModel.findOne(
            {
                "_id":req.params.id
            },projection);

        let agents;
        if(incharge.incharge=="dis"){
            agents = await agentModel.find({"district_incharge._id":incharge._id});
        }else{
            agents = await agentModel.find({"division_incharge._id":incharge._id});
        }

        let commission_history=[];
        let agentList=[];
        

        let emis;
        if(incharge.incharge=="dis"){
            emis = await emiModel.find({"disInchargeId":incharge._id});
        }else{
            emis = await emiModel.find({"divInchargeId":incharge._id});
        }              
        if(agents.length>0){
            agents.map(async(agent)=>{
                let amount;
                let dipositFlg=0;
                if(agent.cash_in.length>0&&dipositFlg==0){
                    amount = agent.cash_in[agent.cash_in.length - 1].amount; 
                    agentList.push({
                        agetId : agent._id,
                        name : agent.name,
                        upazila : agent.upazila,
                        district : agent.district,
                        phone : agent.phone,
                    });

                    if(incharge.incharge=="dis"){
                        commission_history.push({
                            agent : {
                                _id : agent.id,
                                name : agent.name,
                                district : agent.upazila,
                                upazila : agent.upazila,
                                phone : agent.phone
                            },
                            commission : amount*0.03,
                            type : "deposit",
                            date : agent.cash_in[agent.cash_in.length - 1].date
                        });
                    }else{
                        commission_history.push({
                            agent : {
                                _id : agent.id,
                                name : agent.name,
                                district : agent.district,
                                upazila : agent.upazila,
                                phone : agent.phone
                            },
                            commission : amount*0.02,
                            type : "deposit",
                            date : agent.cash_in[agent.cash_in.length - 1].date
                        });
                    }  
                    dipositFlg=1; 
                }
            });
        }

        if(emis.length>0){
            emis.map(async(emi)=>{
                let agent_info = await agentModel.findOne({"_id":emi.agentId});
                //console.log("-----"+agent_info);
                if(incharge.incharge=="dis"){
                    commission_history.push({
                        agent : {
                            _id : agent_info._id,
                            name : agent_info.name,
                            district : agent_info.upazila,
                            upazila : agent_info.upazila,
                            phone : agent_info.phone
                        },
                        commission : emi.amount*0.03,
                        type : "emi",
                        date : emi.createdAt
                    })
                }else{
                    commission_history.push({
                        agent : {
                            _id : agent_info._id,
                            name : agent_info.name,
                            district : agent_info.upazila,
                            upazila : agent_info.upazila,
                            phone : agent_info.phone
                        },
                        commission : emi.amount*0.02,
                        type : "emi",
                        date : emi.createdAt
                    })
                }
            });
        }

        let report = {
            _id : incharge._id,
            name : incharge.name,
            phone: incharge.phone,
            area: incharge.area,
            total_commission: incharge.balance,
            incharge: incharge.incharge,
            agents : agentList,
            commission_history: commission_history,
        }
        
        res.status(200).json({
            data : report,
            success : true
        });
        
    }catch(err){
        res.status(500).json({
          data : err,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}


const getDisIncharge = async (req,res) => {
    try{
        let div_incharge = await adminModel.findOne(
            {
                "_id":req.params.id
            },projection);
        
        let unique_dis=[];
        let inchargeList=[];
        
        let flg = 0;

        if(div_incharge){
            await Promise.all(
                locationData.map(async(area)=>{
                    //console.log(area.division+"=="+div_incharge.area);
                    if(area.division==div_incharge.area){
                        if(unique_dis.includes(area.district)==false){
                            unique_dis.push(area.district)
                        }
                    }
                })
            )
        }

        await Promise.all(
            unique_dis.map(async(dist)=>{
                let dis_inc = await adminModel.findOne({"area":dist,"incharge":"dis"})
                if(dis_inc){
                    inchargeList.push({
                        _id : dis_inc._id,
                        name : dis_inc.name,
                        area : dis_inc.area,
                    });
                }
           })
        )

        res.status(200).json({
            data : inchargeList,
            success : true
        });
    }catch(err){
        res.status(500).json({
          data : err,
          success : false,
          message : "Internal Server Error Occurred."
        });
    }
}



module.exports =  {
    agentReport,
    inchargeReport,
    getDisIncharge
};
