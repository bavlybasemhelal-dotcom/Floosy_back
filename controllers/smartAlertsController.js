const buildCrudController = require('./crudFactory');
const SmartAlert = require('../models/SmartAlert');
module.exports = buildCrudController(SmartAlert);
