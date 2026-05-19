const buildSharedCrudController = require('./sharedCrudFactory');
const Insight = require('../models/Insight');
module.exports = buildSharedCrudController(Insight);
