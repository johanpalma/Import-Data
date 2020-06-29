const url = require('url');
const queryString = require('querystring');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const CarrierModel = require('../models/carrier.model');

function saveCarrier(req, res) {
    const carrier = new CarrierModel(req.body);

    carrier.save((err, CarrierStored) => {
        if (err) { 
            return res.status(500).json({
                message: 'Carrier no save'
            }); 
        } else {
            return res.status(200).json({
                message: CarrierStored
            });
        }
    })
}

function getCarriers(req, res) {
    CarrierModel.find((err, carriersData) => {
      if (err) return res.status(500).json({ message: 'Error in get to data' });

      return res.json({carriersData});
    })
}

function getCarrierById(req, res) {
    const { id } = req.params;
    CarrierModel.findById(id, (err, carrierData) => {
        if (err) return res.status(500).json({ message: 'Error in get to data' });

        return res.json({ carrierData });
    })
}

function getCarrier(req, res) {
    let parsedUrl = url.parse(req.url)
    let parsedQs = queryString.parse(parsedUrl.query);

    CarrierModel.find(parsedQs, (err, carrierData) => {
        if (err) return res.status(500).json({ message: 'Error in get to data', err });

        return res.json({ carrierData });
    })
}

function deleteCarrier(req, res) {
    const { id } = req.params;
    CarrierModel.find({'_id': id}).remove(err => {
        if (err) return res.status(500).json({error: 'data no delete'});

        return res.json({data: 'data delete'});
    })
}

function updateCarrier(req, res) {
    const { id } = req.params;
    const dataUpdate = req.body;
    CarrierModel.findByIdAndUpdate(id, dataUpdate, {new: true}, (err, carrierUpdated) => {
        if(err) return res.status(500).json({ error: 'Error in the request' });

        if (!carrierUpdated) return res.status(500).json({ message: 'Carrier no updated' });

        res.status(200).json({ carrierUpdated });
    })
}

function upload (req, res) {
    let sampleFile;
    let uploadPath;
  
    if (!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send('No files were uploaded.');
      return;
    }
  
    sampleFile = req.files.sampleFile;
  
    uploadPath = path.join(__dirname, '../uploads', sampleFile.name);
  
    sampleFile.mv(uploadPath, function(err) {
      if (err) {
        return res.status(500).send(err);
      }
      
      dataXLSX(uploadPath, res);
    });
}

async function dataXLSX(path, res){
    const carries = [];
    const excel = XLSX.readFile(path);


    var nameSheet = excel.SheetNames;
    let dataEXCEL = XLSX.utils.sheet_to_json(excel.Sheets[nameSheet[0]]);

    dataEXCEL.forEach( async data => {
        carries.push(carrierData(data));

        if(dataEXCEL.length === carries.length){
            await insertMany(carries, res);
            fs.unlinkSync(path);
        }
    });

}

function carrierData(data) {
    const carrier = {
        name: data['NAME'],
        scac: data['SCAC'],
        mc: data['MC'],
        dot: data['DOT'],
        fein: data['FEIN'],
    };

    return carrier;
}

async function insertMany( carries, res ) {
    await CarrierModel.insertMany(carries, (err, data) => {
        if (err) throw Error('Error in insert data', err);
        
        res.status(200).json({
            status: 'successfully',
            countInsert: data.length,
            data
        });
    });
}

module.exports = {
    saveCarrier,
    getCarriers,
    getCarrier,
    getCarrierById,
    deleteCarrier,
    updateCarrier,
    upload
}