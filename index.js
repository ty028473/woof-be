const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mysql = require('mysql')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const router = express.Router()
const path = require('path')
const Promise = require('bluebird')
const authRoute = require('./routes/auth')

dotenv.config()

var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

connection = Promise.promisifyAll(connection)

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

app.listen(8801, () => {
  connection.connect()
  console.log('express app啟動了')
})
