const express = require('express')
const app = express()
const dotenv = require('dotenv')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const authRoute = require('./routes/auth')
const memberRoute = require('./routes/member')
dotenv.config()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  // optionSuccessStatus: 200,
}

app.use(cors(corsOptions))

// 使用這中間件，才可以讀到body的資料
app.use(express.urlencoded({ extended: true }))

// 使用這中間件，才可以解析的到 json 的資料
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.use('/api/auth', authRoute)

// 會員中心的router
app.use('/api/member', memberRoute)

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
