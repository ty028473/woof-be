const express = require('express')
const router = express.Router()
const connection = require('./connection')

//拿保母全部資料（每一個時段＝還要修）
router.get('/', async (req, res) => {
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

// Reservecalendar拿到每個保姆個人頁面
// '/api/Reserve/變數'根據id取得單筆資料
router.get('/:reserveId', async (req, res) => {
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
router.post('/reserve', (req, res) => {})

module.exports = router
