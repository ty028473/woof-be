const express = require('express')
const router = express.Router()
const connection = require('./connection')

//拿保母全部資料（每一個時段）
router.get('/', async (req, res, next) => {
  let data = await connection.queryAsync(
    'SELECT T2.id,name,MIN(title) AS min,MAX(title) AS max,MIN(LEFT(start,10))AS start,MAX(LEFT(start,10))AS end,introduction,T2.district ,score,T1.image FROM member AS T1  JOIN pet_sitter AS T2 ON T1.id = T2.member_id JOIN evaluation T3 ON T2.id = T3.pet_sitter_id  JOIN time T4 ON  T3.pet_sitter_id = T4.pet_sitter_id GROUP BY T2.id  '
  )
  res.json(data)
})

// '/api/Reserve/變數'根據id取得單筆資料
router.get('/:reserveId', async (req, res, next) => {
  //req.params(物件).ReserveId
  let data = await connection.queryAsync(
    'SELECT * FROM member AS T1 INNER JOIN pet_sitter AS T2 ON T1.id = T2.member_id JOIN evaluation T3 ON T2.id = T3.pet_sitter_id  JOIN time T4 ON  T3.pet_sitter_id = T4.pet_sitter_id WHERE T2.id=?',
    [req.params.reserveId]
  )
  if (data.length > 0) {
    //回一個物件
    res.json(data[0])
  } else {
    //empty=44
    //ex:api/Reserve/33
    res.status(404).send('找不到頁面')
  }
})
//album/:img拿到每個保姆個人相簿
router.get('/album/:img', async (req, res, next) => {
  let data = await connection.queryAsync(
    'SELECT * FROM pet_sitter_album WHERE pet_sitter_id=?',
    [req.params.img]
  )

  res.json(data)
})
//album/拿到每個保姆個人評價
router.get('/evalution/:star', async (req, res, next) => {
  let data = await connection.queryAsync(
    'SELECT T2.name,T2.image,T1.create_time,T1.score,T1.content FROM evaluation AS T1 JOIN member AS T2 ON T1.member_id = T2.id WHERE pet_sitter_id=?',
    [req.params.star]
  )

  res.json(data)
})

router.post('/reserve', (req, res) => {})

module.exports = router
