const buildSharedCrudController = require('./sharedCrudFactory');
const Goal = require('../models/Goal');
module.exports = buildSharedCrudController(Goal);
