const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { loginCheckMiddleware } = require('../middlewares/auth')
const path = require('path')
const multer = require('multer')
const bcrypt = require('bcrypt')
const { body, validationResult } = require('express-validator')

// 驗證有沒有登入
router.use(loginCheckMiddleware)

// 取得會員資料
router.get('/', async (req, res) => {
  let data = await connection.queryAsync(
    // 'SELECT member.email, member.name, member.phone, member.birthday, member.gender, member.image, member.total_bonus, COUNT(order_list.id), SUM(order_list.use_bonus) FROM member INNER JOIN order_list ON member.id = order_list.member_id WHERE id = ?',
    // [req.session.member.id]
    'SELECT email, name, phone, birthday, gender, image, total_bonus as totalBonus FROM member WHERE id = ?',
    [req.session.member.id]
  )

  if (data.length > 0) {
    let order = await connection.queryAsync(
      'SELECT COUNT(id) as orderTimes, SUM(use_bonus) as useBonus FROM order_list WHERE member_id = ?',
      [req.session.member.id]
    )
    console.log('order', order)
    data[0] = { ...data[0], ...order[0] }
    res.json(data[0])
  } else {
    res.status(404).send('Not Found')
  }
})

const updateMemberRules = [
  body('name').isLength({ max: 4 }).withMessage('名字不可大於四個字'),
  body('phone').isLength({ min: 10, max: 10 }).withMessage('電話輸入錯誤'),
  body('birthday').isLength({ min: 10, max: 10 }).withMessage('生日輸入錯誤'),
  body('gender').isLength({ min: 1, max: 1 }).withMessage('性別輸入錯誤'),
]

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'memberImg'))
  },
  filename: function (req, file, cb) {
    console.log('filename', file)
    // 取出副檔名
    const ext = file.originalname.split('.').pop()
    cb(null, `member-${Date.now()}.${ext}`)
  },
})

const memberImg = multer({
  storage: storage,
  // 過濾檔案
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
      cb(new Error('不符合允許的檔案類型'), false)
    }
    cb(null, true)
  },
  // 限定檔案大小
  limits: {
    // 1M:1024*1024
    fileSize: 1024 * 1024,
  },
})

// 更新會員資料
router.post(
  '/updateMember',
  memberImg.single('image'),
  updateMemberRules,
  async (req, res) => {
    console.log('req,body', req.body)
    console.log('req,file', req.file)
    const validateResult = validationResult(req)
    if (!validateResult.isEmpty()) {
      // return res.json({ errors: validateResult.array() })
      return res.status(400).json({ errors: validateResult.array() })
    }
    if (req.file) {
      let filename = req.file ? '/memberImg/' + req.file.filename : ''
      let data = await connection.queryAsync(
        `UPDATE member SET name= ?, phone= ?, birthday= ?, gender= ?, image=? WHERE id= ?`,
        [
          req.body.name,
          req.body.phone,
          req.body.birthday,
          req.body.gender,
          filename,
          req.session.member.id,
        ]
      )
      let member = await connection.queryAsync(
        'SELECT * FROM member WHERE id = ?',
        [req.session.member.id]
      )
      member = member[0]
      let returnMember = {
        ...req.session.member,
        id: member.id,
        email: member.email,
        name: member.name,
        states: member.states,
        image: member.image,
      }
      res.json({
        code: '3000',
        message: '會員資料修改成功',
        member: returnMember,
      })
    } else {
      let data = await connection.queryAsync(
        `UPDATE member SET name= ?, phone= ?, birthday= ?, gender= ? WHERE id= ?`,
        [
          req.body.name,
          req.body.phone,
          req.body.birthday,
          req.body.gender,
          req.session.member.id,
        ]
      )
      res.json({ code: '3000', message: '會員資料修改成功' })
    }
  }
)

const updatePasswordRules = [
  body('password')
    .custom((value, { req }) => {
      return value !== req.body.newPassword
    })
    .withMessage('請輸入與原本密碼不相同的密碼'),
  body('newPassword').isLength({ min: 6 }).withMessage('密碼長度至少為 6'),
  body('confirmPassword')
    .custom((value, { req }) => {
      return value === req.body.newPassword
    })
    .withMessage('密碼不一致'),
]

// 更新密碼
router.post('/changePassword', updatePasswordRules, async (req, res) => {
  console.log('req,body', req.body)
  // 比對密碼
  let memberPassword = await connection.queryAsync(
    'SELECT password FROM member WHERE id = ?',
    [req.session.member.id]
  )

  // 把第0筆抓出來，後面就不用使用時都要加[0]
  memberPassword = memberPassword[0]

  let result = await bcrypt.compare(req.body.password, memberPassword.password)
  if (!result) {
    // 密碼比對失敗
    return res.status(400).json({ code: '3100', message: '原本的密碼錯誤' })
  }
  const validateResult = validationResult(req)
  if (!validateResult.isEmpty()) {
    // validateResult 不是空的，那表示有欄位沒有通過驗證
    // 文件的寫法 https://express-validator.github.io/docs/
    return res
      .status(400)
      .json({ code: '3101', errors: validateResult.array() })
  }

  // 密碼加密 bcrypt
  let hashPassword = await bcrypt.hash(req.body.newPassword, 10)

  // 更新密碼
  let updatePassword = await connection.queryAsync(
    'UPDATE member SET password= ? WHERE id = ?',
    [hashPassword, req.session.member.id]
  )
  res.json({ code: '3102', message: '密碼更新成功' })
})
module.exports = router
