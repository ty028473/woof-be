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

// 查看 登入會員 session 的 bonus
router.get('/member/bonus', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT total_bonus FROM member WHERE id = ?',
    [req.session.member.id]
  )
  // console.log('我在測試我的member_id', req.session)
  res.json(data)
})

// 查看 登入會員 session 的 pet
router.get('/member/pets', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT name FROM pet WHERE member_id = ?',
    [req.session.member.id]
  )
  res.json(data)
})

// Cart.js 寫入主訂單 + 子訂單
router.post('/order_insert', async (req, res) => {
  try {
    // 先判斷有無資料
    if (req.body.length === 0) {
      return res.status(200).json({ code: 105, message: '購物車沒資料' })
    }
    // 如果有資料就存進資料庫(主訂單)
    if (req.body.length > 0) {
      let orderList = await connection.queryAsync(
        `INSERT INTO  order_list ( member_id,check_status,use_bonus,total_sum,create_time ) VALUES (?,?,?,?,?)`,
        [
          req.session.member.id,
          2,
          req.body[1].use_bonus,
          req.body[1].total_sum,
          new Date(),
        ]
      )
      // 找主訂單的最後一個 orderList.insertId
      // (子訂單)
      for (let i = 0; i < req.body[0].length; i++) {
        let orderDetail = await connection.queryAsync(
          `INSERT INTO  order_detail(order_id,order_status,pet_sitter_id,district,start,end,title, address,pet_id,evaluation_states)VALUES(?)`,
          [
            [
              orderList.insertId,
              1,
              req.body[0][i].pet_sitter_id,
              req.body[0][i].district,
              moment(req.body[0][i].start).format('YYYY/MM/DD HH:mm:ss'),
              moment(req.body[0][i].end).format('YYYY/MM/DD HH:mm:ss'),
              req.body[0][i].title,
              req.body[0][i].address,
              req.body[0][i].pet_id,
              0,
            ],
          ]
        )
      }
      res.status(200).json({ orderId: orderList.insertId })
    }
  } catch (err) {
    console.error(err)
    res.json('沒收到資料')
  }
})

// local stroge 找保母照片跟名稱
router.post('/member/findImg', async (req, res) => {
  // 先從 pet_sitter.id 找 member_id
  let findMember = await connection.queryAsync(
    'SELECT member_id FROM pet_sitter WHERE id = ?',
    [req.body.pet_sitter_id] // 好幾個 pet_sitter.id
  )
  // res.json(findMember)
  let findImg = await connection.queryAsync(
    'SELECT image,name FROM member WHERE id = ?',
    [findMember[0].member_id] // 好幾個 member.id
  )
  res.json(findImg)
})

// OrderCheck.js 將登入會員 session 狀態為「未結帳」訂單資料顯示出來
router.get('/member/checkList', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT order_detail.start,order_detail.end,order_detail.title,order_detail.district,order_detail.address,order_detail.pet_id AS pet_name,member.name AS pet_sitter_name,member.image,order_list.use_bonus,order_list.total_sum FROM order_list JOIN order_detail  ON order_list.id = order_detail.order_id JOIN pet_sitter  ON order_detail.pet_sitter_id = pet_sitter.id JOIN member  ON member.id = pet_sitter.member_id WHERE order_list.check_status = 2 AND order_list.member_id = ?',
    [req.session.member.id]
  )
  res.json(data)
})

// OrderCheck.js 更新主訂單狀態為「已結帳」
router.post('/order_update', async (req, res) => {
  try {
    // 先判斷有無資料
    // if (req.body.length === 0) {
    //   return res.status(200).json({ code: 105, message: '沒有要結帳的訂單' })
    // }
    // if (req.body.length > 0) {
    let orderUpdate = await connection.queryAsync(
      `UPDATE order_list SET check_status = 1 WHERE id = ?`,
      [req.body.orderId]
    )
    // }
    res.status(200).json({ code: '0', message: '結帳成功' })
  } catch (err) {
    console.error(err)
    res.json({ code: '999', message: '失敗結帳失敗' })
  }
})

module.exports = router
