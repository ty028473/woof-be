const express = require('express')
//引用
const app = express()
//建立web server

const dotenv = require('dotenv')

const mysql = require('mysql')

const helmet = require('helmet')
const morgan = require('morgan')
const multer = require('multer')
const cors = require('cors')
const path = require('path')
const authRoute = require('./routes/auth')
const memberRouter = require('./routes/member')
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

//路由 router-->其實有算是一種中間件
//app.Method(path.Handler)
//Method:POST GET ....
//Handler=一個函式兩個參數（req res）

//

app.use(cors(corsOptions))
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.use('/api/auth', authRoute)

//這個中間件事負責做紀錄的
// app.use((req, res, next) => {
//   console.log(`${req.url}找不到路由`)
//   next()
// })

//8801 port

app.use('/api/member', memberRouter)
app.use('/api/reserve', reserveRouter)

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
