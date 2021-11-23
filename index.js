const express = require('express')
// 引用
const app = express()
// 建立web server
const dotenv = require('dotenv')
const mysql = require('mysql')
const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const authRoute = require('./routes/auth')
const memberRouter = require('./routes/member')
const ordersRouter = require('./routes/orders')
const reserveRouter = require('./routes/reserve')
dotenv.config()

const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  // optionSuccessStatus: 200,
}

//告訴express有一個中間件
//middlewave=函式，會有三個參數（req res next）<
//呼叫next去下一個，沒有next 就會停止
app.use((req, res, next) => {
  console.log('我是中間件')
  next()
  //依照上而下去呼叫，不需要知道下一個是什麼
})

// 允許跨源
app.use(cors(corsOptions))

// 讀到 body 的資料
app.use(express.urlencoded({ extended: true }))
// 解析得到 json 的資料
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

// 這個中間件事負責做紀錄的
app.use((req, res, next) => {
  console.log(`${req.url}找不到路由`)
  next()
})

// 8801 port 後端路由總集合
app.use('/api/member', memberRouter)
app.use('/api/reserve', reserveRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/auth', authRoute)

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
