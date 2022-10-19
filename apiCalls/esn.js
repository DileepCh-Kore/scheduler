const config = require('../config.json')
const generateUUID = require('../uuid')
const axios = require('axios').default;
const jwtURL = config.jwtURL;
const fs = require('fs');
let jwtToken = '';
let reTryFlag = false;
function getEsnData() {
    const genereateJWT = async () => {
        await axios.get(jwtURL).then((response) => {
            jwtToken = response.data;
        });
    }

    const requestBody = {
        statement: config.esnStatement,
        resultSetMetaData: {
          format: "json"
        },
        database: config.database,
        schema: config.schema,
        warehouse: config.warehouse,
        role: config.role
      }

    const uuid = generateUUID();
    const url = config.snowFlakeAPIendpoint + uuid;
    const updateEsnData = async () => {
        try {
            let res = await axios.post(url, JSON.stringify(requestBody), {
                headers: {
                    'X-Snowflake-Authorization-Token-Type': 'KEYPAIR_JWT',
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                }
            }).then((response) => {
                let csvDataArr = [];
                for (let item of response.data.data) {
                    let temp = [...item, new Date().toISOString()]
                    csvDataArr.push([...temp])
                }
                let csvData = csvDataArr.map(item => item.join(";"));
                csvData = csvData.join('\n')
                fs.writeFileSync('./csvSheets/esn.csv', csvData);
            })
        } catch (error) {
            console.log(error);
            reTryFlag = true;
        }
    }
    genereateJWT().then(() => {
        updateEsnData();
        while(reTryFlag){
            reTryFlag =false;
            updateEsnData();
        }
    });
}

module.exports = getEsnData;