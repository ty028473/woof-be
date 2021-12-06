const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { loginCheckMiddleware } = require('../middlewares/auth')
const moment = require('moment')
const path = require('path')
const multer = require('multer')

// 驗證有沒有登入
router.use(loginCheckMiddleware)

router.get('/', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT member.email, member.name, member.phone, member.birthday, member.gender, member.image, pet_sitter.district, pet_sitter.address, pet_sitter.skill, pet_sitter.introduction FROM member INNER JOIN pet_sitter ON member.id = pet_sitter.member_id WHERE member.id = ?',
    [req.session.member.id]
  )

  if (data.length > 0) {
    res.json(data[0])
  } else {
    res.status(404).send('Not Found')
  }
})

router.post('/updatepetSitter', async (req, res) => {
  console.log('req,body', req.body)

  let data = await connection.queryAsync(
    `UPDATE pet_sitter SET district= ?, address= ?, skill= ?, introduction= ? WHERE id= ?`,
    [
      req.body.district,
      req.body.address,
      req.body.skill,
      req.body.introduction,
      req.session.member.petSitterId,
    ]
  )
  res.json({ code: '4000', message: '保母會員資料修改成功' })
})

router.post('/joinus', async (req, res) => {
  console.log('req,body', req.body)

  let data = await connection.queryAsync(
    `INSERT INTO pet_sitter (member_id, ID_number, district, address, create_time) VALUES (?, ?, ?, ?, ?)`,
    [
      req.session.member.id,
      req.body.ID_number,
      req.body.district,
      req.body.address,
      moment().format('YYYY/MM/DD HH:mm:ss'),
    ]
  )
  res.json({ code: '4001', message: '保母申請成功' })
})

// 處理相簿圖片
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'petsitterAlbum'))
  },
  filename: function (req, file, cb) {
    console.log('filename', file)
    // 取出副檔名
    const ext = file.originalname.split('.').pop()
    cb(null, `petsitterAlbum-${Date.now()}.${ext}`)
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

// 相簿圖片上傳
router.post('/album', memberImg.single('image'), async (req, res) => {
  let filename = req.file ? '/petsitterAlbum/' + req.file.filename : ''
  let data = await connection.queryAsync(
    `INSERT INTO pet_sitter_album (pet_sitter_id, image, create_time) VALUES (?, ?, ?)`,
    [
      req.session.member.petSitterId,
      filename,
      moment().format('YYYY/MM/DD HH:mm:ss'),
    ]
  )
  res.json({ code: '4001', message: '相簿圖片上傳成功' })
})

// 抓取相簿圖片
router.get('/getAlbum', async (req, res) => {
  let data = await connection.queryAsync(
    `SELECT id, image FROM pet_sitter_album WHERE pet_sitter_id = ? AND delete_time IS NULL`,
    [req.session.member.petSitterId]
  )
  if (data.length > 0) {
    res.json(data)
  } else {
    res.status(404).send('Not Found')
  }
})

// 刪除相簿圖片
router.post('/deleteAlbumImage', async (req, res) => {
  console.log('req,body', req.body.id)
  let data = await connection.queryAsync(
    `UPDATE pet_sitter_album SET delete_time= ? WHERE id= ?`,
    [moment().format('YYYY/MM/DD HH:mm:ss'), req.body.id]
  )
  res.json({ code: '4001', message: '簿圖片刪除成功' })
})

module.exports = router
