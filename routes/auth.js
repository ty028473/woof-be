const express = require('express')
const router = express.Router()
const connection = require('./connection')
const bcrypt = require('bcrypt')
const moment = require('moment')
const { body, validationResult } = require('express-validator')

// 註冊資料驗證
const registerRules = [
  body('email').isEmail().withMessage('Email 欄位請正確填寫'), // 文件中會有
  body('password').isLength({ min: 6 }).withMessage('密碼長度至少為 6'),
  body('name').isLength({ max: 4 }).withMessage('名字不可大於四個字'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('電話請填10碼'),
  body('birthday').isLength({ min: 10, max: 10 }).withMessage('生日輸入錯誤'),
  body('gender').isLength({ min: 1, max: 1 }).withMessage('性別輸入錯誤'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .withMessage('密碼不一致'),
]

// 註冊
router.post('/signup', registerRules, async (req, res) => {
  const validateResult = validationResult(req)
  if (!validateResult.isEmpty()) {
    // validateResult 不是空的，那表示有欄位沒有通過驗證
    // 文件的寫法 https://express-validator.github.io/docs/
    return res.status(400).json({ errors: validateResult.array() })
  }
  // 表示 validateResult 是空的 ==> 都通過驗證了

  // 是否已註冊
  try {
    let member = await connection.queryAsync(
      'SELECT * FROM member WHERE email = ?',
      req.body.email
    )

    if (member.length > 0) {
      // 表示這個 email 已經存在過
      return res.json({ code: '0002', message: '該 email 已註冊' })
    }

    // email 不存在，可建立帳號
    // 密碼加密 bcrypt
    let hashPassword = await bcrypt.hash(req.body.password, 10)

    // 建立一筆資料

    let result = await connection.queryAsync(
      'INSERT INTO member (email, password, name, gender, phone, birthday, create_time) VALUES (?)',
      [
        [
          req.body.email,
          hashPassword,
          req.body.name,
          req.body.gender,
          req.body.phone,
          req.body.birthday,
          moment().format('YYYY/MM/DD HH:mm:ss'),
        ],
      ]
    )

    res.json({ code: '0000', message: '註冊成功' })
  } catch (e) {
    console.error(e)
    res.json({ code: '0001', message: '註冊失敗' })
  }
})

// 登入
router.post('/login', async (req, res) => {
  try {
    // 比對帳號
    let member = await connection.queryAsync(
      'SELECT * FROM member WHERE email = ?',
      [req.body.email]
    )

    if (member.length === 0) {
      // 查無此帳號
      return res.json({ code: '1000', message: '帳號或密碼錯誤' })
    }

    // 把第0筆抓出來，後面就不用使用時都要加[0]
    member = member[0]

    // 比對密碼
    let result = await bcrypt.compare(req.body.password, member.password)
    if (!result) {
      // 密碼比對失敗
      return res.json({ code: '1000', message: '帳號或密碼錯誤' })
    }

    // 比對資料成功，寫進session
    // 自訂要存什麼資料
    let returnMember = {
      id: member.id,
      email: member.email,
      name: member.name,
      states: member.states,
      image:member.image
    }
    req.session.member = returnMember
    res.json({ code: '1001', message: '登入成功', member: returnMember })
  } catch (e) {
    console.error(e)
    return res.json({ code: '1002', message: '登入失敗' })
  }
})

// 登出
router.get('/logout', (req, res) => {
  try {
    req.session.member = null
    return res.json({ code: '2000', message: '登出成功' })
  } catch (e) {
    console.error(e)
    return res.json({ code: '2001', message: '登出失敗' })
  }
})
module.exports = router
