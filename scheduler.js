const schedule = require('node-schedule')
const getRegionData = require("./apiCalls/region");
const getDivisionAndBuData = require('./apiCalls/divisionAndBu');
const getCategoryAndCommodityData = require('./apiCalls/categoryAndCommodity');
const getEsnData = require('./apiCalls/esn')


// schedule.scheduleJob({date:2})
const job = schedule.scheduleJob({rule:'*/10 * * * *'}, function(){
    getRegionData();
    getDivisionAndBuData();
    getCategoryAndCommodityData();
    getEsnData();
  });