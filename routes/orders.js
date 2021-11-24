const express = require('express')
const router = express.Router()
const connection = require('./connection')
const moment = require('moment')

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
    'SELECT total_bonus FROM member WHERE id = 1'
  )
  res.json(data)
})

// 查看 member_id =1 的 pet
router.get('/member/pets', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT name FROM pet WHERE member_id = 1'
  )
  res.json(data)
})

// 寫入主訂單
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
        [1, 2, 1, req.body[1].use_bonus, req.body[1].total_sum, new Date()]
      )
      // 找主訂單的最後一個 index id
      let findOrderListMax = await connection.queryAsync(
        `SELECT MAX(ID) FROM order_list WHERE id`
      )
      console.log('我是findOrderListMax', findOrderListMax[0]['MAX(ID)'])

      // (子訂單)
      for (let i = 0; i < req.body[0].length; i++) {
        let orderDetail = await connection.queryAsync(
          `INSERT INTO  order_detail(order_id,pet_sitter_id,district,start,end,title, address,pet_id)VALUES(?)`,
          [
            [
              findOrderListMax[0]['MAX(ID)'],
              req.body[0][i].pet_sitter_id,
              req.body[0][i].district,
              moment(req.body[0][i].start).format('YYYY/MM/DD HH:mm:ss'),
              moment(req.body[0][i].end).format('YYYY/MM/DD HH:mm:ss'),
              req.body[0][i].title,
              req.body[0][i].address,
              req.body[0][i].pet_id,
            ],
          ]
        )
      }
    }
    res.status(200).json(req.body)
  } catch (err) {
    console.error(err)
    res.json('沒收到資料')
  }
})

module.exports = router
