const config = require('../config.json')
const generateUUID = require('../uuid')
const axios = require('axios').default;
const jwtURL = config.jwtURL;
const fs  = require('fs');
let jwtToken = '';
let reTryFlag = false;


function getCategoryAndCommodityData() {
    const genereateJWT = async () => {
        await axios.get(jwtURL).then((response) => {
           jwtToken =  response.data;
        });
   }
   
   const requestBody = {
       statement: config.catAndCommodityStatement,
       resultSetMetaData: {
         format: "json"
       },
       database: config.database,
       schema: config.schema,
       warehouse: config.warehouse,
       role: config.role
     }
   
   const uuid = generateUUID();
   const url = config.snowFlakeAPIendpoint + uuid ;
   const updateCategoryAndCommodityData = async () =>{
        try {
            let res = await axios.post(url,JSON.stringify(requestBody),{
                headers:{
                    'X-Snowflake-Authorization-Token-Type':'KEYPAIR_JWT',
                    'Content-Type':'application/json',
                    'Accept':'application/json',
                    'Authorization' : `Bearer ${jwtToken}`
                }
            }).then((response) => {
                let csvDataArr = [];
                for(let item of response.data.data){
                    let temp = [...item,new Date().toISOString()]
                    csvDataArr.push([...temp])
                }
                let csvData = csvDataArr.map(item => item.join(";")).join('\n');
                // console.log(csvDataArr)
                fs.writeFileSync('./csvSheets/categoryAndCommodity.csv',csvData)
            })
        } catch (error) {
            console.log(error)
            reTryFlag = true
        }
   }
   genereateJWT().then(()=>{
    updateCategoryAndCommodityData();
    while(reTryFlag){
        reTryFlag =false;
        updateCategoryAndCommodityData();
    }
   });
}

module.exports = getCategoryAndCommodityData;