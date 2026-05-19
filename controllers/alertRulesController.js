const buildCrudController = require('./crudFactory');
const AlertRule = require('../models/AlertRule');
module.exports = buildCrudController(AlertRule);
