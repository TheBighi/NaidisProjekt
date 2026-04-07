const { EnergyReading } = require('../models');

const fetchAndSaveEleringData = async (startIso, endIso, locations = ["EE", "LV", "FI"]) => {
    try {
        const eleringRegions = locations.map(loc => loc.toLowerCase()).join(',');
        
        const url = new URL('https://dashboard.elering.ee/api/nps/price');
        url.searchParams.append('start', startIso);
        url.searchParams.append('end', endIso);
        
        url.searchParams.append('fields', eleringRegions); 
        
        console.log(`Fetching from Elering: ${url.toString()}`);
        
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Elering API not OK");
        
        const result = await response.json();

        if (!result.success || !result.data) {
            console.log("No data returned from Elering API.");
            return 0;
        }

        let allCleanData = [];

        for (const location of locations) {
            const regionKey = location.toLowerCase();
            const externalData = result.data[regionKey];

            if (externalData && externalData.length > 0) {
                const cleanData = externalData.map(reading => ({
                    timestamp: new Date(reading.timestamp * 1000), 
                    location: location.toUpperCase(),
                    price_eur_mwh: reading.price,
                    source: "API", 
                    createdAt: new Date(),
                    updatedAt: new Date()
                }));
                allCleanData = allCleanData.concat(cleanData);
            }
        }

        if (allCleanData.length === 0) {
            console.log("No new data to save.");
            return 0;
        }

        await EnergyReading.bulkCreate(allCleanData, {
            updateOnDuplicate: ['price_eur_mwh', 'updatedAt'] 
        });

        console.log(`Successfully saved/updated ${allCleanData.length} records.`);
        return allCleanData.length;

    } catch (error) {
        throw error; 
    }
};

module.exports = { fetchAndSaveEleringData };