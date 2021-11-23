const express = require('express')
const router = express.Router()
const connection = require('./connection')

// 查看所有 order_list 資料
router.get('/order_list', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM order_list')
  res.json(data)
})

// 查看所有 order_detail 資料
router.get('/order_detail', async (req, res) => {
  let data = await connection.queryAsync('SELECT * FROM order_detail')
  res.json(data)
})

// 查看 member_id =1 的 bonus
router.get('/member/bonus', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT total_bonus FROM member WHERE id = 23'
  )
  res.json(data)
})

// 寫入訂單 (接 local 資料)
router.post('/order_insert', async (req, res) => {
  try {
    // 先判斷有無資料
    if (req.body.length === 0) {
      return res.status(200).json({ code: 105, message: '購物車沒資料' })
    }
    // 如果有資料就存進資料庫(主訂單)
    if (req.body.length > 0) {
      let orderList = await connection.queryAsync(
        `INSERT INTO  order_list ( member_id,check_status,order_status,use_bonus,total_sum,create_time ) VALUES (?,?,?,?,?,?)`,
        [23, 2, 1, req.body[1].use_bonus, req.body[1].total_sum, new Date()]
      )
      // TODO: 先查主訂單 member_id 下訂那個人「未結帳」 把那個訂單的 id 值抓出來存成變數

    }
    console.log('req.body', req.body[0])
    res.status(200).json(req.body[0])
  } catch (err) {
    console.error(err)
    res.json('沒收到資料')
  }
})

module.exports = router
