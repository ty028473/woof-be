const express = require('express')
const router = express.Router()
const connection = require('./connection')
const moment = require('moment')
//顯示保母時段（後台）
router.get('/sitter/:timeId', async (req, res) => {
  try {
    let data = await connection.queryAsync(
      'SELECT * FROM time WHERE pet_sitter_id=?',
      [req.params.timeId]
    )
    res.json(data)
  } catch (e) {
    res.status(404).send('找不到頁面')
  }
})
//寫入時段
router.post('/sitter/time_insert', async (req, res) => {
  try {
    let timeDetail = await connection.queryAsync(
      'INSERT INTO time (pet_sitter_id, start, end, title) VALUES (?,?,?,?)',

      [
        req.body.extendedProps.pet_sitter_id,

        moment(req.body.start).format('YYYY/MM/DD HH:mm:ss'),
        moment(req.body.end).format('YYYY/MM/DD HH:mm:ss'),
        req.body.title,
      ]
    )
    console.log(req.body.extendedProps.pet_sitter_id)
    // }
    res.status(200).json({ code: '5000', message: '時段資料輸入成功' })
  } catch (err) {
    console.error(err)
    res.json({ code: '999', message: '輸入失敗' })
  }
})

//刪除時段
router.post('/sitter/time_removed', async (req, res) => {
  try {
    let timeRemoveDetail = await connection.queryAsync(
      'DELETE FROM time WHERE title=?',
      [req.body.title]
    )

    // }
    res.status(200).json({ code: '5001', message: '時段資料刪除成功' })
  } catch (err) {
    console.error(err)
    res.json({ code: '999', message: '輸入失敗' })
  }
})

//顯示保母時段（前台）
router.get('/:timeId', async (req, res) => {
  try {
    let data = await connection.queryAsync(
      'SELECT * FROM time WHERE pet_sitter_id=?',
      [req.params.timeId]
    )
    console.log(req.params.timeId)
    res.json(data)
  } catch (e) {
    res.status(404).send('找不到頁面')
  }
  // let data = await connection.queryAsync(
  //   'SELECT * FROM time WHERE pet_sitter_id=?',
  //   [req.params.timeId]
  // )
  // console.log(req.params.timeId)
  // if (data.length > 0) {
  //   //回一個物件
  //   res.json(data)
  // } else {
  //   //empty=44
  //   //ex:api/Reserve/33
  //   res.status(404).send('找不到頁面')
  // }
})

module.exports = router
