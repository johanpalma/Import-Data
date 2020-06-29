const {  Router } = require('express');
const router = Router();

const { validationExtension } = require('../middleware/validation');

const { saveCarrier, getCarriers, getCarrierById,
        deleteCarrier, updateCarrier, getCarrier, upload } = require('../controllers/carrier.controller');

router.post('/create_carrier', saveCarrier);
router.post('/upload_excel_carrier', validationExtension, upload);
router.get('/get_carriers', getCarriers);
router.get('/get_carriers/q', getCarrier);
router.get('/get_carrier/:id', getCarrierById);
router.delete('/delete_carrier/:id', deleteCarrier);
router.put('/update_carrier/:id', updateCarrier);

module.exports = router;