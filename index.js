const express = require('express')
const app = express()
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const authRoute = require('./routes/auth')
const memberRouter = require('./routes/member')
dotenv.config()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  // optionSuccessStatus: 200,
}

app.use(cors(corsOptions))
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.use('/api/auth', authRoute)

app.get('/api/order_list', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM order_list')
  res.json(data)
})

app.get('/api/order_detail', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM order_detail')
  res.json(data)

app.use('/api/member', memberRouter)

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
