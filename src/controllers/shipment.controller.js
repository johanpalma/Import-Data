const url = require('url');
const queryString = require('querystring');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const ShipmentModel = require('../models/shipment.model');

function saveShipment(req, res) {
    const shipment = new ShipmentModel(req.body);

    shipment.save((err, ShipmentStored) => {
        if (err) { 
            return res.status(500).json({
                message: 'shipment no save'
            }); 
        } else {
            return res.status(200).json({
                message: ShipmentStored
            });
        }
    })
}

function getShipments(req, res) {
    ShipmentModel.find((err, shipmentData) => {
      if (err) return res.status(500).json({ message: 'Error in get to data' });

      return res.json({shipmentData});
    })
}

function getShipmentById(req, res) {
    const { id } = req.params;
    ShipmentModel.findById(id, (err, shipmentData) => {
        if (err) return res.status(500).json({ message: 'Error in get to data' });

        return res.json({ shipmentData });
    })
}

function getShipment(req, res) {
    let parsedUrl = url.parse(req.url)
    let parsedQs = queryString.parse(parsedUrl.query);

    ShipmentModel.find(parsedQs, (err, shipmentData) => {
        if (err) return res.status(500).json({ message: 'Error in get to data', err });

        return res.json({ shipmentData });
    })
}

function deleteShipment(req, res) {
    const { id } = req.params;
    ShipmentModel.find({'_id': id}).remove(err => {
        if (err) return res.status(500).json({error: 'data no delete'});

        return res.json({data: 'data delete'});
    })
}

function updateShipment(req, res) {
    const { id } = req.params;
    const dataUpdate = req.body;
    ShipmentModel.findByIdAndUpdate(id, dataUpdate, {new: true}, (err, shipmentUpdated) => {
        if(err) return res.status(500).json({ error: 'Error in the request' });

        if (!shipmentUpdated) return res.status(500).json({ message: 'Shipment no updated' });

        res.status(200).json({ shipmentUpdated });
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
    const shipments = [];
    var index;
    const excel = XLSX.readFile(path);


    var nameSheet = excel.SheetNames;
    
    if (nameSheet.length > 1) {
        index = 2;
    } else {
        index = 0;
    }

    let dataEXCEL = XLSX.utils.sheet_to_json(excel.Sheets[nameSheet[index]]);


    dataEXCEL.forEach( async data => {
        shipments.push(shipmentData(data));

        if(dataEXCEL.length === shipments.length){
            await insertMany(shipments, res);
            fs.unlinkSync(path);
        }
    });

}

function shipmentData(data) {
    const shipment = {
        carrier_id: data['CARRIER ID'],
        date: data['DATE'],
        origin_country: data['ORIIGN COUNTRY'],
        origin_state: data['ORIGIN STATE'],
        origin_city: data['ORIGIN CITY'],
        destination_country: data['DESTINATION COUNTRY'],
        destination_state: data['DESTINATION STATE'],
        destination_city: data['DESTINATION CITY'],
        pickup_date: data['PICKUP DATE'],
        delivery_date: data['DELIVERY DATE'],
        status: data['STATUS'],
        carrier_rate: data['CARRIER RATE'],
    };

    return shipment;
}

async function insertMany( shipments, res ) {
    await ShipmentModel.insertMany(shipments, (err, data) => {
        if (err) throw Error('Error in insert data', err);
        
        res.status(200).json({
            status: 'successfully',
            countInsert: data.length,
            data
        });
    });
}

module.exports = {
    saveShipment,
    getShipments,
    getShipment,
    getShipmentById,
    deleteShipment,
    updateShipment,
    upload
}