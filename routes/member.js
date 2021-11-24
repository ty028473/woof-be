const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { body, validationResult } = require('express-validator')

router.get('/', async (req, res) => {
  //怎麼知道有登入
  if (req.session.member) {
    // 存在代表已登入

    let data = await connection.queryAsync(
      'SELECT * FROM member WHERE id = ?',
      [req.session.member.id]
    )
    // let data = await connection.queryAsync(
    //   'SELECT id, email, name, phone, birthday, gender FROM member WHERE id = ?',
    //   [req.session.member.id]
    // )

    if (data.length > 0) {
      res.json(data[0])
    } else {
      res.status(404).send('Not Found')
    }
    // res.json(req.session.member)
  } else {
    // 1. req.session.member 這個變數不存在
    // 2. 雖然有req.session.member 但是是null
    res.json({ code: '1201', message: '尚未登入' })
  }
})

const registerRules = [
  body('name').isLength({ max: 4 }).withMessage('名字不可大於四個字'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('電話輸入錯誤'),
  body('birthday').isLength({ min: 10, max: 10 }).withMessage('生日輸入錯誤'),
  body('gender').isLength({ min: 1, max: 1 }).withMessage('性別輸入錯誤'),
]

router.post('/updateMember', registerRules, async (req, res) => {
  const validateResult = validationResult(req)
  if (!validateResult.isEmpty()) {
    return res.status(400).json({ errors: validateResult.array() })
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
  res.json({ code: '3000', message: '會員資料修改成功' })
})

module.exports = router
