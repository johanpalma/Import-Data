const express = require('express');
const morgan = require('morgan');
const app = express();
const expressUpload = require('express-fileupload');

// Imports Routes
const shipmentRoutes = require('./routes/shipment.route');
const carrierRoutes = require('./routes/carrier.route');
const orderRoutes = require('./routes/order.router');

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(expressUpload());

// use routes
app.use('/demo', shipmentRoutes);
app.use('/demo', carrierRoutes);
app.use('/demo', orderRoutes);

module.exports = app