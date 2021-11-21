const router = require('express').Router()
const bcrypt = require('bcrypt')
const mysql = require('mysql')
const dotenv = require('dotenv')

const { body, validationResult } = require('express-validator')
const Promise = require('bluebird')

var moment = require('moment') // require
dotenv.config()

var connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
})

connection = Promise.promisifyAll(connection)

const registerRules = [
  body('email').isEmail().withMessage('Email 欄位請正確填寫'), // 文件中會有
  body('password').isLength({ min: 6 }).withMessage('密碼長度至少為 6'),
  // 客製化 (custom(得到的值,{req}))
  body('name').isLength({ min: 2 }).withMessage('名子請大於2個字'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('電話請填10碼'),

  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .withMessage('密碼不一致'),
]

router.post('/signup', registerRules, async (req, res) => {
  try {
    const validation = validationResult(req)
    if (!validation.isEmpty()) {
      // 如果 validationResult 不是空的，代表有欄位沒有通過
      let error = validation.array()
      return res.status(400).json({ code: 99, message: error })
    }

    let member = await connection.queryAsync(
      'SELECT * FROM member WHERE email = ?;',
      [req.body.email]
    )
    if (member.length > 0) {
      res.json({ code: 0, message: '已註冊' })
    }
    if (member.length == 0) {
      if (validation.isEmpty()) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)
        let now = moment().format()

        console.log(now)
        // // 如果 validationResult 空的，
        let setmember = await connection.queryAsync(
          `INSERT INTO  member ( name,email,password,gender,phone,birthday,create_time ) VALUES (?,?,?,?,?,?,?)`,
          [
            req.body.name,
            req.body.email,
            hashedPassword,
            req.body.gender,
            req.body.phone,
            req.body.date,
            moment().format('YYYY-MM-DD HH:mm:ss'),
          ]
        )
        return res.status(200).json({ code: 105, message: '寫入成功' })
      }
    }
    // 如果是空的代表通過驗證 ...
  } catch (err) {
    console.error(err)
    res.json({ code: '9999', message: '請洽系統管理員' })
  }
})

router.post('/login', async (req, res) => {
  try {
    let member = await connection.queryAsync(
      'SELECT * FROM member WHERE email = ?',
      [req.body.email]
    )
    if (member.length === 0) {
      return res.json({ code: '1103', message: '帳號或密碼錯誤' })
    }
    member = member[0]

    let result = await bcrypt.compare(req.body.password, member.password)
    if (!result) {
      return res.json({ code: '1104', message: '帳號或密碼錯誤' })
    }
    let returnMember = {
      id: member.id,
      name: member.name,
    }
    res.json({ code: '0', message: '登入成功', returnMember })
  } catch (err) {
    // console.error(err)
    return res.json({ code: '9999', message: '請洽系統管理員' })
  }
})

module.exports = router
