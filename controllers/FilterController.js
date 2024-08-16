const mysql = require('mysql2/promise');
const Joi = require('joi');
const axios = require('axios');
const db = require('../models/user');

// Create a connection pool
// Create a connection pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'cmsfylqm_storyfypro',
    password: 'cmsfylqm_storyfypro',
    database: 'cmsfylqm_storyfypro',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Define schema for request validation
const schema = Joi.object({
    page: Joi.number().min(1).default(1),
    pageSize: Joi.number().min(1).max(100).default(10),
    sortBy: Joi.string().allow('').default('id'),
    sortOrder: Joi.string().allow('').default('DESC'),
    speaker: Joi.number().allow('').min(0).max(1),
    supertutors: Joi.number().allow('').min(0).max(1),
    professionaltutors: Joi.number().allow('').min(0).max(1),
    minPrice: Joi.number().allow(''),
    maxPrice: Joi.number().allow(''),
    search: Joi.string().trim().allow(''),
    categories: Joi.string().trim().allow(''),
    country: Joi.string().trim().allow(''),
    level: Joi.string().trim().allow(''),
    speak: Joi.string().trim().allow(''),
    duration: Joi.string().trim().allow(''),
    currency: Joi.string().trim().allow(''),
    timezone: Joi.string().trim().allow(''),
    specialties: Joi.string().trim().allow('')
});

exports.FilterAllLatest = async (req, res) => {
  try {
      const { error, value } = schema.validate(req.query); // Change to req.query
      // console.log(value)
      if (error) {
        return res.status(400).json({ error: error.details[0].message });
      }
      // return res.json({ error: error, value:value });
      const { page, pageSize, sortBy, sortOrder, country, level, specialties, speaker, supertutors, professionaltutors, search, categories, minPrice, maxPrice, speak, duration, currency, timezone} = value;
      const offset = (page - 1) * pageSize;
  
      let query = 'SELECT * FROM latest WHERE id IS NOT NULL'; // Use IS NOT NULL
      const params = [];
  
      // if (country) {
      //   query += ' AND country = ?';
      //   params.push(country);
      // }

      if (duration) {
          const durationArr = duration.split(',').map(c => c.trim());
          const durationConditions = durationArr.map(() => 'duration = ?').join(' OR ');
          query += ` AND (${durationConditions})`;
          params.push(...durationArr);
      }

      if (country) {
          const countries = country.split(',').map(c => c.trim());
          const countryConditions = countries.map(() => 'country = ?').join(' OR ');
          query += ` AND (${countryConditions})`;
          params.push(...countries);
      }

      
  
      if (level) {
        query += ' AND level = ?';
        params.push(level);
      }
  
      // if (speak) {
      //   query += ' AND speak = ?';
      //   params.push(speak);
      // }

      
      if (speak) {
          const speakArr = speak.split(',').map(c => c.trim());
          const speakConditions = speakArr.map(() => 'speak LIKE ?').join(' OR ');
          query += ` AND (${speakConditions})`;
          params.push(...speakArr.map(spk => `%${spk}%`));
      }
    
        
        
  
      if (specialties) {
        query += ' AND specialties LIKE ?';
        params.push(`%${specialties}%`);
      }
  
      if (categories) {
        query += ' AND categories LIKE ?';
        params.push(`%${categories}%`);
      }
  
      if (search) {
          query += ' AND (name LIKE ? OR lastname LIKE ? OR description LIKE ? OR mobileNumber LIKE ? OR categories LIKE ? OR duration LIKE ? OR speak LIKE ? OR certificate LIKE ?)';
          params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
    
      
      if (speaker != '' && speaker != undefined) {
        query += ' AND speaker = ?';
        params.push(`${speaker}`);
      }
  
  
      if (supertutors != '' && supertutors != undefined) {
        query += ' AND Supertutors = ?';
        params.push(`${supertutors}`);
      }
  
      if (professionaltutors != ''  && professionaltutors != undefined ) {
        query += ' AND professionaltutors = ?';
        params.push(`${professionaltutors}`);
      }

      if (minPrice) {
        query += ' AND price >= ?';
        params.push(minPrice);
      }

      if (maxPrice) {
        query += ' AND price <= ?';
        params.push(maxPrice);
      }
      
       // Add sorting
      if (sortBy && sortOrder) {
        const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortBy} ${order}`;
      }
      // Build the count query dynamically
      const countQuery = 'SELECT COUNT(*) AS total FROM latest ' + (query.includes('WHERE') ? query.substring(query.indexOf('WHERE')) : '');
      query += ' LIMIT ? OFFSET ?';
      params.push(pageSize, offset);
      
      const connection = await pool.getConnection();
      const finalQuery = pool.format(query, params);
      const countQueryfinalQuery = pool.format(countQuery, params);
      console.log('Final Query:', finalQuery);
      console.log('countQuery Final Query:', countQueryfinalQuery);
      const [results, fields] = await connection.query(query, params);
      // console.log(connection,results, fields)
      // Parse JSON columns
      const parsedResults = results.map(result => {
        
          try {
            result.Schedule = JSON.parse(result.Schedule); 
            result.certificate = JSON.parse(result.certificate); 
            result.Education = JSON.parse(result.Education); 
            
            if(currency && currency != 'USD'){
                const amount = result.price; // Amount in original currency
                const fromCurrency = 'USD'; // Original currency
                const toCurrency = currency; // Target currency
                
                const convertedAmount = convertCurrency(amount, fromCurrency, toCurrency);
                result.price = convertedAmount.toFixed(2)
                console.log(`${amount} ${fromCurrency} is equivalent to ${convertedAmount.toFixed(2)} ${toCurrency}`);
            }
            // result.speak = JSON.parse(result.speak); 
          } catch (error) {
              console.error('Error parsing JSON:', error);
              result.Schedule = result.Schedule; 
              result.certificate = result.certificate; 
              result.Education = result.Education; 
              // result.speak = result.speak; 
          }
          return result;
      });    
      // console.log(parsedResults)
      const [count] = await connection.query(countQuery, params.slice(0, -2));
      connection.release();
      const totalPages = Math.ceil(count[0].total / pageSize);
      res.json({
        page,
        pageSize,
        totalPages,
        totalItems: count[0].total,
        data: parsedResults
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
}


// Function to convert currency
function convertCurrency(amount, fromCurrency, toCurrency) {
  // https://v6.exchangerate-api.com/v6/d2eaf77bc074979622668763/latest/USD

  const exchangeRates = {
    "USD":1,
    "AED":3.6725,
    "AFN":71.2126,
    "ALL":95.6137,
    "AMD":392.7469,
    "ANG":1.7900,
    "AOA":843.2126,
    "ARS":857.4200,
    "AUD":1.5400,
    "AWG":1.7900,
    "AZN":1.7010,
    "BAM":1.8200,
    "BBD":2.0000,
    "BDT":109.7208,
    "BGN":1.8200,
    "BHD":0.3760,
    "BIF":2860.0098,
    "BMD":1.0000,
    "BND":1.3519,
    "BOB":6.9207,
    "BRL":5.0142,
    "BSD":1.0000,
    "BTN":83.4155,
    "BWP":13.7546,
    "BYN":3.2656,
    "BZD":2.0000,
    "CAD":1.3566,
    "CDF":2741.9416,
    "CHF":0.9045,
    "CLP":979.2321,
    "CNY":7.2482,
    "COP":3850.9685,
    "CRC":502.7564,
    "CUP":24.0000,
    "CVE":102.6083,
    "CZK":23.5175,
    "DJF":177.7210,
    "DKK":6.9443,
    "DOP":59.1708,
    "DZD":134.6929,
    "EGP":47.1753,
    "ERN":15.0000,
    "ETB":56.7407,
    "EUR":0.9306,
    "FJD":2.2564,
    "FKP":0.7963,
    "FOK":6.9438,
    "GBP":0.7963,
    "GEL":2.6870,
    "GGP":0.7963,
    "GHS":13.2619,
    "GIP":0.7963,
    "GMD":67.6411,
    "GNF":8543.8867,
    "GTQ":7.7957,
    "GYD":209.3888,
    "HKD":7.8247,
    "HNL":24.6787,
    "HRK":7.0113,
    "HTG":132.9048,
    "HUF":367.0205,
    "IDR":15923.7634,
    "ILS":3.6881,
    "IMP":0.7963,
    "INR":83.4094,
    "IQD":1308.0463,
    "IRR":42069.9085,
    "ISK":139.3242,
    "JEP":0.7963,
    "JMD":153.9419,
    "JOD":0.7090,
    "JPY":151.5569,
    "KES":131.3669,
    "KGS":89.3768,
    "KHR":4044.5099,
    "KID":1.5401,
    "KMF":457.8062,
    "KRW":1353.0347,
    "KWD":0.3076,
    "KYD":0.8333,
    "KZT":447.0842,
    "LAK":20813.7436,
    "LBP":89500.0000,
    "LKR":299.8151,
    "LRD":193.5541,
    "LSL":18.9484,
    "LYD":4.8380,
    "MAD":10.0862,
    "MDL":17.6545,
    "MGA":4389.9824,
    "MKD":56.9404,
    "MMK":2102.1086,
    "MNT":3391.8941,
    "MOP":8.0595,
    "MRU":39.7978,
    "MUR":46.4126,
    "MVR":15.4249,
    "MWK":1735.8554,
    "MXN":16.6244,
    "MYR":4.7282,
    "MZN":63.8671,
    "NAD":18.9484,
    "NGN":1302.6125,
    "NIO":36.7852,
    "NOK":10.9430,
    "NPR":133.4649,
    "NZD":1.6787,
    "OMR":0.3845,
    "PAB":1.0000,
    "PEN":3.7247,
    "PGK":3.8013,
    "PHP":56.2458,
    "PKR":278.2571,
    "PLN":3.9950,
    "PYG":7355.2045,
    "QAR":3.6400,
    "RON":4.6090,
    "RSD":108.5888,
    "RUB":92.3166,
    "RWF":1287.5032,
    "SAR":3.7500,
    "SBD":8.5104,
    "SCR":13.6359,
    "SDG":453.9337,
    "SEK":10.7834,
    "SGD":1.3518,
    "SHP":0.7963,
    "SLE":22.7128,
    "SLL":22712.7751,
    "SOS":571.3425,
    "SRD":35.3201,
    "SSP":1583.5134,
    "STN":22.7988,
    "SYP":12902.3991,
    "SZL":18.9484,
    "THB":36.5372,
    "TJS":10.9448,
    "TMT":3.4998,
    "TND":3.1292,
    "TOP":2.3461,
    "TRY":32.3033,
    "TTD":6.7819,
    "TVD":1.5401,
    "TWD":32.0270,
    "TZS":2558.1294,
    "UAH":39.0988,
    "UGX":3890.3628,
    "UYU":37.5640,
    "UZS":12634.3605,
    "VES":36.2611,
    "VND":24833.5401,
    "VUV":118.5384,
    "WST":2.7335,
    "XAF":610.4082,
    "XCD":2.7000,
    "XDR":0.7555,
    "XOF":610.4082,
    "XPF":111.0457,
    "YER":250.3369,
    "ZAR":18.9482,
    "ZMW":25.0300,
    "ZWL":20853.4601
  };
  const exchangeRate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
  return amount * exchangeRate;
}


exports.getExchangerate = async (req, res) => {

  const apiUrl = 'https://open.er-api.com/v6/latest/USD';

    await axios.get(apiUrl)
      .then(response =>  {
        // Handle successful response
        let exchangeRateData = JSON.stringify(response.data);
        const query = 'UPDATE exchange_rate SET content = ? WHERE id = ?';
        db.query(query, [exchangeRateData, 1])
        .then(result => {
          console.log("result", result);
          return res.status(200).json({ success: true, message: 'Exchange rate updated successfully.' });
        })
        .catch(error => {
          console.error('Error updating exchange rate:', error);
          return res.status(500).json({ error: 'Something went wrong while updating exchange rate.' });
        });
      })
      .catch(error => {
        // Handle error
        console.error('Error fetching data:', error);
        return res.status(500).json({ error: 'Error fetching data:'+ error });
      });
  
   
}

// exports.FilterAllLatest = async (req, res) => {
//     try {
//         const { error, value } = schema.validate(req.body);
//         // return console.log(error, value)
//         if (error) {
//           return res.status(400).json({ error: error.details[0].message });
//         }
    
//         const { page, pageSize, country, level, specialties } = value;
//         const offset = (page - 1) * pageSize;
    
//         let query = 'SELECT * FROM latest WHERE id != "" ';
//         const params = [];
    
//         if (country) {
//           query += ' AND country = ?';
//           params.push(country);
//         }
    
//         if (level) {
//           query += ' AND level = ?';
//           params.push(level);
//         }
    
//         if (specialties) {
//           query += ' AND specialties LIKE ?';
//           params.push(`%${mysql.escape(specialties)}%`);
//         }
    
//         const countQuery = 'SELECT COUNT(*) AS total FROM latest WHERE id != "" ' + query.slice(14);

//         query += ' LIMIT ? OFFSET ?';
//         params.push(pageSize, offset);
    
//         const connection = await pool.getConnection();
//         const [results, fields] = await connection.query(query, params);
//         const [count] = await connection.query(countQuery, params.slice(0, -2));
//         connection.release();
    
//         const totalPages = Math.ceil(count[0].total / pageSize);
    
//         res.json({
//           page,
//           pageSize,
//           totalPages,
//           totalItems: count[0].total,
//           data: results
//         });
//       } catch (error) {
//         console.error('Error:', error);
//         res.status(500).json({ error: 'Internal server error' });
//       }
// }
