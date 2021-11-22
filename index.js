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
app.get('/', (req, res) => {
  console.log('我是首頁')
  res.send('我是首頁')
})
app.get('/member', (req, res) => {
  console.log('我是會員')

  res.send('我是會員')
})
//

app.use(cors(corsOptions))
app.use(express.json())
app.use(helmet())
app.use(morgan('common'))

app.use('/api/auth', authRoute)

app.get('/api/time', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM time')
  res.json(data)
})
app.get('/api/pet_sitter', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM pet_sitter')
  res.json(data)
})
//拿保母全部資料（每一個時段＝還要修）
app.get('/api/reserve', async (req, res) => {
  let data = await connection.queryAsync(
    //抓最小值
    'SELECT T2.id,name,MIN(title) AS min,MAX(title) AS max,introduction,T4.district ,score FROM member AS T1  JOIN pet_sitter AS T2 ON T1.id = T2.member_id JOIN evaluation T3 ON T2.id = T3.pet_sitter_id  JOIN time T4 ON  T3.pet_sitter_id = T4.pet_sitter_id GROUP BY T2.id  '
  ) //抓最大值
  // let data2 = await connection.queryAsync(
  //   'SELECT title FROM member AS T1  JOIN pet_sitter AS T2 ON T1.id = T2.member_id JOIN evaluation T3 ON T2.id = T3.pet_sitter_id  JOIN time T4 ON  T3.pet_sitter_id = T4.pet_sitter_id  ORDER BY title DESC LIMIT 1 '
  // )
  // if (data2.length > 0) {
  //   data[0].max = data2[0].title
  // }
  // res.json([data, data2])
  res.json(data)
})

//Reservecalendar拿到每個保姆個人頁面
//'/api/Reserve/變數'根據id取得單筆資料
app.get('/api/reserve/:reserveId', async (req, res) => {
  //req.params(物件).ReserveId
  let data = await connection.queryAsync(
    'SELECT * FROM member AS T1 INNER JOIN pet_sitter AS T2 ON T1.id = T2.member_id JOIN evaluation T3 ON T2.id = T3.pet_sitter_id WHERE T2.id=?',
    [req.params.reserveId]
  )
  if (data.length > 0) {
    //回一個物件
    res.json(data[0])
  } else {
    //empty=44
    //ex:api/Reserve/33
    res.status(404).send('404')
  }
})

//這個中間件事負責做紀錄的
app.use((req, res, next) => {
  console.log(`${req.url}找不到路由`)
  next()
})

//前面path都不符合--404
app.use((req, res, next) => {
  console.log('我是路由後面的中間件')
  res.status(404).send('404')
})

//8801 port

app.use('/api/member', memberRouter)

app.use((req, res, next) => {
  res.status(404).send('找不到頁面')
})

app.listen(8801, () => {
  console.log('express app啟動了')
})
