const cron = require('node-cron');
const { fetchAndSaveEleringData } = require('./services/eleringService');

cron.schedule('0 15 * * *', async () => {
    console.log('Running daily Elering fetch job for all regions...');
    
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    tomorrow.setUTCHours(0, 0, 0, 0);
    const startIso = tomorrow.toISOString();
    
    tomorrow.setUTCHours(23, 59, 59, 999);
    const endIso = tomorrow.toISOString();
    
    await fetchAndSaveEleringData(startIso, endIso);
    
    console.log('Daily Elering fetch job completed.');
});