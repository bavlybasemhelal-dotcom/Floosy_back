const buildSharedCrudController = require('./sharedCrudFactory');
const Bill = require('../models/Bill');
module.exports = buildSharedCrudController(Bill);
