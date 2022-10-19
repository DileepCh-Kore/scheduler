const router = require('express').Router();
const fs = require('fs');

router.get('/',async (req,res)=>{
    let  result= {};
    try {
        const catAndCommodityData = fs.readFileSync('./../csvSheets/categoryAndCommodity.csv','utf-8').split("\n").map((item)=>  item.split(";"));
        const divAndBuData = fs.readFileSync('./../csvSheets/divisionAndBu.csv','utf-8').split("\n").map((item)=>  item.split(";"));
        const esnData = fs.readFileSync('./../csvSheets/esn.csv','utf-8').split("\n").map((item)=>  item.split(";"));
        const regionData = fs.readFileSync('./../csvSheets/region.csv','utf-8').split("\n").map((item)=>  item.split(";"));

        result['categoryAndCommodity'] = catAndCommodityData;
        result['divisionAndBu'] = divAndBuData;
        result['esn'] = esnData;
        result['region'] = regionData;
        res.send({
            statusCode: 200,
            message : "Data retrieval successful",
            result
        })
    } catch (error) {
        console.log(error)
        res.send({
            statusCode : 500,
            message: "Internal server Error. Please try again"
        })
    }
});

module.exports = router