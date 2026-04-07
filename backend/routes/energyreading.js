const express = require('express')
const router = express.Router()

const eReadingController = require('../controllers/eReading');

router.post("/api/import/json", eReadingController.importJsonData)
router.get("/api/readings", eReadingController.getReadingsInRange)
router.post('/api/sync/prices', eReadingController.syncPrices);

module.exports = router;