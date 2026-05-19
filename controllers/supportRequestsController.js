const buildCrudController = require('./crudFactory');
const SupportRequest = require('../models/SupportRequest');
module.exports = buildCrudController(SupportRequest);
