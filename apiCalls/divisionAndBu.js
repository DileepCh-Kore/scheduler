const config = require('../config.json')
const generateUUID = require('../uuid')
const axios = require('axios').default;
const jwtURL = config.jwtURL;
const fs  = require('fs');
let jwtToken = '';
let reTryFlag = false;
function getDivisionAndBuData() {
    const genereateJWT = async () => {
        await axios.get(jwtURL).then((response) => {
           jwtToken =  response.data;
        });
   }
   
   const requestBody = {
    statement: config.divAndBuStatement,
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
   const updateDivisionAndBuData = async () =>{
       let res =  await axios.post(url,JSON.stringify(requestBody),{
            headers:{
                'X-Snowflake-Authorization-Token-Type':'KEYPAIR_JWT',
                'Content-Type':'application/json',
                'Accept':'application/json',
                'Authorization' : `Bearer ${jwtToken}`
            }
        }).then(async (response) => {
            if(response.data.message === 'Statement executed successfully.'){
                try {
                    let csvDataArr = [];
                    for (let item of response.data.data) {
                        let temp = [...item, new Date().toISOString()]
                        csvDataArr.push([...temp])
                    }
                    let csvData = csvDataArr.map(item => item.join(";")).join('\n');
                    // console.log(csvDataArr)
                    fs.writeFileSync('./csvSheets/divisionAndBu.csv', csvData);
                } catch (error) {
                    reTryFlag = true;
                    fs.writeFileSync('../error.txt', error.toString());
                        console.log(error);
                }
            }
            else{
                let retryURL = config.retryURL + uuid
                let retryRes = await axios.post(retryURL,JSON.stringify(requestBody),{
                    headers:{
                        'X-Snowflake-Authorization-Token-Type':'KEYPAIR_JWT',
                        'Content-Type':'application/json',
                        'Accept':'application/json',
                        'Authorization' : `Bearer ${jwtToken}`
                    }}).then((retryResponse) =>{
                    for (let item of retryResponse.data.data) {
                        let temp = [...item, new Date().toISOString()]
                        csvDataArr.push([...temp])
                    }
                    let csvData = csvDataArr.map(item => item.join(";")).join('\n');
                    // console.log(csvDataArr)
                    fs.writeFileSync('./csvSheets/divisionAndBu.csv', csvData)
                    })
            }
        })
        
   }
   genereateJWT().then(()=>{
    updateDivisionAndBuData()
   
   });
}

module.exports = getDivisionAndBuData;