require('./cron.js')
const app = require('./app.js');

app.listen(3001, () => {
  console.log('Server running at http://127.0.0.1:3001');
});