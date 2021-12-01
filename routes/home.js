const express = require('express')
const router = express.Router()
const connection = require('./connection')
const moment = require('moment')

// 查看所有 pet_sistter_id recommend 推薦資料
router.get('/recommend', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT member.image,member.name,evaluation.score,evaluation.content FROM member JOIN pet_sitter ON member.id=pet_sitter.member_id JOIN evaluation ON member.id=evaluation.member_id WHERE member.states=2'
  )
  res.json(data)
})

module.exports = router
