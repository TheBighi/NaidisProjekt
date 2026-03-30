const { EnergyReading } = require('../models');
const { Op } = require('sequelize');

const importJsonData = async (req, res) => {
    const eReadings = req.body
    const eReadingLen = eReadings.length
    const cleanData = []
    let duplicatesDetected = 0

    const allowedLocations = ["EE", "LV", "FI"]

    const is_invalid_timestamp = (ts) => {
        const date = new Date(ts)
        if (isNaN(date.getTime())) return true
        if (date.getFullYear() < 2000) return true
        return false
    }

    const candidateKeys = [...new Map(
        eReadings
            .filter(r => r.timestamp && r.location && !is_invalid_timestamp(r.timestamp))
            .map(r => ({ timestamp: r.timestamp, location: r.location ?? "EE" }))
            .map(k => [`${new Date(k.timestamp).toISOString()}__${k.location}`, k])
    ).values()]

    const existingRecords = candidateKeys.length > 0
        ? await EnergyReading.findAll({
            where: { [Op.or]: candidateKeys },
            attributes: ['timestamp', 'location']
        })
        : []

    const existingSet = new Set(
        existingRecords.map(r => `${new Date(r.timestamp).toISOString()}__${r.location}`)
    )

    for (let eReading of eReadings) {
        if ("timestamp" in eReading && "location" in eReading && "price_eur_mwh" in eReading && Object.keys(eReading).length == 3) {
            if (eReading.location == null) {
                eReading.location = "EE"
            }
            if (allowedLocations.includes(eReading.location)) {
                if (eReading.price_eur_mwh !== null && !isNaN(Number(eReading.price_eur_mwh))) {
                    if (!is_invalid_timestamp(eReading.timestamp)) {
                        const key = `${new Date(eReading.timestamp).toISOString()}__${eReading.location}`
                        if (existingSet.has(key)) {
                            duplicatesDetected += 1
                        } else {
                            eReading.createdAt = new Date()
                            eReading.updatedAt = new Date()
                            eReading.source = "UPLOAD"
                            cleanData.push(eReading)
                            existingSet.add(key)
                        }
                    }
                }
            }
        }
    }

    try {
        await EnergyReading.bulkCreate(cleanData, {
            ignoreDuplicates: true,
            fields: ['timestamp', 'location', 'price_eur_mwh', 'source', 'createdAt', 'updatedAt']
        })
    } catch (err) {
        console.error("BulkCreate failed:", err.message, err.parent?.message)
        return res.status(500).json({ error: err.message, detail: err.parent?.message })
    }

    res.json({ 
        "Inserted": cleanData.length, 
        "Skipped": eReadingLen - cleanData.length, 
        "duplicates_detected": duplicatesDetected 
    })
}

const getReadingsInRange = async (req, res) => {
    const { start, end, location } = req.query;
    console.log("Received query params:", { start, end, location });

    EnergyReading.findAll({
        where: {
            timestamp: { [Op.between]: [new Date(start), new Date(end)] },
            location: location
        }
    }).then((readings) => {
        res.json(readings);
    }).catch((err) => {
        console.error("Failed to fetch readings:", err.message);
        res.status(500).json({ error: err.message });
    });
};

module.exports = { importJsonData, getReadingsInRange }