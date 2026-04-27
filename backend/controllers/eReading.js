const { EnergyReading } = require('../models');
const { Op } = require('sequelize');
const { fetchAndSaveEleringData } = require('../services/eleringService');
const ApiError = require('../utils/ApiError');
const { parseRange } = require('../utils/validation');

const importJsonData = async (req, res, next) => {
    const eReadings = req.body

    if (!Array.isArray(eReadings)) {
        return next(new ApiError(400, 'Body must be an array', 'VALIDATION_ERROR'))
    }

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
        return next(new ApiError(500, 'Import failed.', 'IMPORT_FAILED'))
    }

    return res.json({ 
        "Inserted": cleanData.length, 
        "Skipped": eReadingLen - cleanData.length, 
        "duplicates_detected": duplicatesDetected 
    })
}


const getReadingsInRange = async (req, res, next) => {
    const { start, end, location } = req.query;
    const requestedLocation = location || "EE";

    const parsedRange = parseRange(start, end);
    if (!parsedRange) {
        return next(new ApiError(400, 'Invalid date range. Use ISO 8601', 'VALIDATION_ERROR'));
    }

    try {
        let readings = await EnergyReading.findAll({
            where: {
                timestamp: { [Op.between]: [parsedRange.startDate, parsedRange.endDate] },
                location: requestedLocation
            },
            order: [['timestamp', 'ASC']]
        });

        if (readings.length === 0) {
            console.log(`Data missing for ${requestedLocation}. Fetching ALL regions from Elering...`);
            
            const startIso = parsedRange.startDate.toISOString();
            const endIso = parsedRange.endDate.toISOString();

            await fetchAndSaveEleringData(startIso, endIso);

            readings = await EnergyReading.findAll({
                where: {
                    timestamp: { [Op.between]: [parsedRange.startDate, parsedRange.endDate] },
                    location: requestedLocation
                },
                order: [['timestamp', 'ASC']]
            });
        }

        res.json(readings);

    } catch (err) {
        next(new ApiError(500, 'Failed to fetch readings.', 'READINGS_FETCH_FAILED'));
    }
};

const syncPrices = async (req, res, next) => {
    try {
        const { start, end } = req.body; 

        let startIso, endIso;

        if (start && end) {
            const parsedRange = parseRange(start, end);
            if (!parsedRange) {
                return next(new ApiError(400, 'Invalid date range. Use ISO 8601', 'VALIDATION_ERROR'));
            }

            startIso = parsedRange.startDate.toISOString();
            endIso = parsedRange.endDate.toISOString();
        } else {
            const now = new Date();
            now.setUTCHours(0, 0, 0, 0);
            startIso = now.toISOString();

            const endOfToday = new Date(now);
            endOfToday.setUTCHours(23, 59, 59, 999);
            endIso = endOfToday.toISOString();
        }

        console.log(`Frontend triggered manual sync for range: ${startIso} to ${endIso}`);
        const recordsSaved = await fetchAndSaveEleringData(startIso, endIso);

        res.json({ 
            success: true, 
            message: "Sync completed successfully", 
            records_saved: recordsSaved 
        });

    } catch (err) {
        console.error('Sync error:', err);
        next(new ApiError(503, 'Price API unavailable.', 'PRICE_API_UNAVAILABLE'));
    }
};

const cleanupReadings = async (req, res, next) => {
    try {
        const { source } = req.query;

        if (source !== 'UPLOAD') {
            return next(new ApiError(400, 'Only source=UPLOAD is supported', 'VALIDATION_ERROR'));
        }

        const deletedCount = await EnergyReading.destroy({
            where: {
                source: 'UPLOAD'
            }
        });

        if (deletedCount === 0) {
            return res.json({ message: 'No UPLOAD records found.' });
        }

        return res.json({ message: `Deleted ${deletedCount} uploaded records.` });
    } catch (err) {
        return next(new ApiError(500, 'Cleanup failed.', 'CLEANUP_FAILED'));
    }
};

module.exports = { importJsonData, getReadingsInRange, syncPrices, cleanupReadings };