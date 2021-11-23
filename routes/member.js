const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { body, validationResult } = require('express-validator')

router.get('/', async (req, res) => {
  let data = await connection.queryAsync('SELECT FROM member WHERE id = ?', [1])

  if (data.length > 0) {
    res.json(data[0])
    console.log(data)
  } else {
    res.status(404).send('Not Found')
  }
})

const registerRules = [
  body('name').isLength({ max: 4 }).withMessage('名字不可大於四個字'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('電話輸入錯誤'),
  body('birthday').isLength({ min: 10, max: 10 }).withMessage('生日輸入錯誤'),
  body('gender').isLength({ min: 1, max: 1 }).withMessage('性別輸入錯誤'),
]

router.post('/updateMember', registerRules, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  let data = await connection.queryAsync(
    `UPDATE member SET name= ?, phone= ?, birthday= ?, gender= ? WHERE id= ?`,
    [
      req.body.name,
      req.body.phone,
      req.body.birthday,
      req.body.gender,
      req.body.id,
    ]
  )
})

module.exports = router
