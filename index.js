const express = require('express')
// 引用
const app = express()
// 建立web server
const dotenv = require('dotenv')
dotenv.config()
const helmet = require('helmet')
const morgan = require('morgan')
const cors = require('cors')
const expressSession = require('express-session')
let FileStore = require('session-file-store')(expressSession)
const path = require('path')

// 引用routes
const authRouter = require('./routes/auth')
const memberRouter = require('./routes/member')
const ordersRouter = require('./routes/orders')
const homeRouter = require('./routes/home')
const reserveRouter = require('./routes/reserve')

// 讀取圖檔
app.use(express.static('public'))

//告訴express有一個中間件
//middlewave=函式，會有三個參數（req res next）<
//呼叫next去下一個，沒有next 就會停止
app.use((req, res, next) => {
  console.log('我是中間件')
  next()
  //依照上而下去呼叫，不需要知道下一個是什麼
})

// 後端告訴瀏覽器我允許跨源存取
// 跨源存取預設的情況不會帶著 cookie
// 就算後端已經同意 cors，但瀏覽器還是不會帶著cookie
app.use(
  cors({
    // 因為我們要開放跨源讀寫 cookie，所以必須設定好源(origin)
    origin: ['http://localhost:3000'],
    // 允許跨源存取cookie
    credentials: true,
    // optionSuccessStatus: 200,
  })
)

app.use(
  expressSession({
    store: new FileStore({ path: path.join(__dirname, '..', 'sessions') }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
)

// 讀到 body 的資料
app.use(express.urlencoded({ extended: true }))
// 解析得到 json 的資料
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

// 8801 port 後端路由總集合
app.use('/api/member', memberRouter)
app.use('/api/reserve', reserveRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/home', homeRouter)
app.use('/api/auth', authRouter)

// 這個中間件事負責做紀錄的
app.use((req, res, next) => {
  console.log(`${req.url}找不到路由`)
  next()
})

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

//錯誤處理 有四個參數
app.use((err, req, res, next) => {
  console.log(err)
  res.status(500).json({ code: '9999' })
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
