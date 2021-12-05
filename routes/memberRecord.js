const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { loginCheckMiddleware } = require('../middlewares/auth')
const moment = require('moment')

// 驗證有沒有登入
router.use(loginCheckMiddleware)

// 取得會員訂單進行中資料
router.get('/carryOut', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT order_detail.pet_sitter_id, order_detail.order_status, order_detail.district, order_detail.address, order_detail.start, order_detail.end, order_detail.title AS price, order_detail.pet_id AS petName FROM order_detail INNER JOIN order_list ON order_list.id = order_detail.order_id WHERE order_list.member_id = ? AND order_list.check_status = ? AND order_detail.order_status = ?',
    [req.session.member.id, 1, 1]
  )

  if (data.length > 0) {
    // 將保母id轉換成保母會員名稱跟保母會員圖片
    for (let i = 0; i < data.length; i++) {
      let getPetSitterData = await connection.queryAsync(
        'SELECT name as petSitterName, image as petSitterImage FROM member WHERE id = ?',
        [data[i].pet_sitter_id]
      )
      data[i] = { ...data[i], ...getPetSitterData[0] }
      // delete data[i].pet_sitter_id
    }
    res.json(data)
  } else {
    res.status(404).send('Not Found')
  }
})

// 取得會員訂單已完成資料
router.get('/complete', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT order_detail.pet_sitter_id, order_detail.order_status, order_detail.district, order_detail.address, order_detail.start, order_detail.end, order_detail.title AS price, order_detail.pet_id AS petName FROM order_detail INNER JOIN order_list ON order_list.id = order_detail.order_id WHERE order_list.member_id = ? AND order_list.check_status = ? AND order_detail.order_status = ?',
    [req.session.member.id, 1, 2]
  )

  if (data.length > 0) {
    // 將保母id轉換成保母會員名稱跟保母會員圖片
    for (let i = 0; i < data.length; i++) {
      let getPetSitterData = await connection.queryAsync(
        'SELECT name as petSitterName, image as petSitterImage FROM member WHERE id = ?',
        [data[i].pet_sitter_id]
      )
      data[i] = { ...data[i], ...getPetSitterData[0] }
      // delete data[i].pet_sitter_id
    }
    res.json(data)
  } else {
    res.status(404).send('Not Found')
  }
})

// 取得會員訂單已取消資料
router.get('/cancel', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT order_detail.pet_sitter_id, order_detail.order_status, order_detail.district, order_detail.address, order_detail.start, order_detail.end, order_detail.title AS price, order_detail.pet_id AS petName FROM order_detail INNER JOIN order_list ON order_list.id = order_detail.order_id WHERE order_list.member_id = ? AND order_list.check_status = ? AND order_detail.order_status = ?',
    [req.session.member.id, 1, 3]
  )

  if (data.length > 0) {
    // 將保母id轉換成保母會員名稱跟保母會員圖片
    for (let i = 0; i < data.length; i++) {
      let getPetSitterData = await connection.queryAsync(
        'SELECT name as petSitterName, image as petSitterImage FROM member WHERE id = ?',
        [data[i].pet_sitter_id]
      )
      data[i] = { ...data[i], ...getPetSitterData[0] }
      // delete data[i].pet_sitter_id
    }
    res.json(data)
  } else {
    res.status(404).send('Not Found')
  }
})

// 評價
router.post('/evaluation', async (req, res) => {
  console.log('req,body', req.body)

  let data = await connection.queryAsync(
    `INSERT INTO evaluation (member_id, pet_sitter_id, content, score, created_time) VALUES (?, ?, ?, ?, ?)`,
    [
      req.session.member.id,
      req.body.pet_sitter_id,
      req.body.content,
      req.body.score,
      moment().format('YYYY/MM/DD HH:mm:ss'),
    ]
  )

  res.json({ code: '6000', message: '評價新增成功' })
})

module.exports = router
