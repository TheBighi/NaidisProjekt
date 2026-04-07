const express = require('express')
const cors = require('cors')

require('./cron.js')

const app = express()

app.use(cors({
  origin: 'http://localhost:5173' // Allow only your frontend
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true}))

const Sequelize = require('sequelize')

const sequelize = new Sequelize('NaidisProjekt', 'bigi', 'qwerty', {
  host: '127.0.0.1',
  dialect: 'mysql',
  port: 3306
});

sequelize.authenticate()
  .then(() => {
    console.log('Connected to DB');
  })
  .catch(err => {
    console.error('DB error:', err)
  });

app.get('/', (req, res) => {
    res.send('OK')
})

app.get('/api/health', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ 
      status: "ok", 
      db: "ok" });
  } catch (err) {
    res.json({ 
      status: "ok", 
      db: "fail" });
  }
})

const energyreadingRouter = require('./routes/energyreading');
app.use('/', energyreadingRouter);




app.listen(3001, () => {
  console.log('Server running at http://127.0.0.1:3001');
});