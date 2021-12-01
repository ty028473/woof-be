const express = require('express')
const router = express.Router()
const connection = require('./connection')

router.get('/:timeId', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT * FROM time WHERE pet_sitter_id=?',
    [req.params.timeId]
  )
  console.log(req.params.timeId)
  if (data.length > 0) {
    //回一個物件
    res.json(data)
  } else {
    //empty=44
    //ex:api/Reserve/33
    res.status(404).send('找不到頁面')
  }
})

module.exports = router
