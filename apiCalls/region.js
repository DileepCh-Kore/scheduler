const config = require('../config.json')
const generateUUID = require('../uuid')
const axios = require('axios').default;
const jwtURL = config.jwtURL;
const fs  = require('fs');
let jwtToken = '';
let reTryFlag = false;
function getRegionData() {
    const genereateJWT = async () => {
        await axios.get(jwtURL).then((response) => {
           jwtToken =  response.data;
        });
   }
   
   const requestBody = {
    statement: config.regionStatement,
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
   const updateRegionData = async () =>{
        try {
            let res = await axios.post(url,JSON.stringify(requestBody),{
                headers:{
                    'X-Snowflake-Authorization-Token-Type':'KEYPAIR_JWT',
                    'Content-Type':'application/json',
                    'Accept':'application/json',
                    'Authorization' : `Bearer ${jwtToken}`
                }
            }).then((response) => {
               // console.log(response.data)
                let regionData = [];
                for(let country of response.data.data){
                    let temp = [...country,new Date().toISOString()]
                    regionData.push([...temp])
                }
                let csvData = regionData.map(item => item.join(";")).join('\n');
                fs.writeFileSync('./csvSheets/region.csv',csvData)
            })
        } catch (error) {
            console.log(error);
            reTryFlag = true;
        }
   }
   genereateJWT().then(()=>{
       updateRegionData()
       while(reTryFlag){
        reTryFlag =false;
        updateRegionData();
    }
   });
}

module.exports = getRegionData;