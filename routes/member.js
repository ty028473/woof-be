const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { loginCheckMiddleware } = require('../middlewares/auth')
const path = require('path')
const multer = require('multer')
const { body, validationResult } = require('express-validator')

// 驗證有沒有登入
router.use(loginCheckMiddleware)

router.get('/', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT email, name, phone, birthday, gender, image FROM member WHERE id = ?',
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
})
const registerRules = [
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

router.post(
  '/updateMember',
  memberImg.single('image'),
  registerRules,
  async (req, res) => {
    console.log('req,body', req.body)
    console.log('req,file', req.file)
    const validateResult = validationResult(req)
    if (!validateResult.isEmpty()) {
      return res.status(400).json({ errors: validateResult.array() })
    }

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
    res.json({ code: '3000', message: '會員資料修改成功' })
  }
)

module.exports = router
