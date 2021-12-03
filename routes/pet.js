const express = require('express')
const router = express.Router()
const connection = require('./connection')
const moment = require('moment')
const { loginCheckMiddleware } = require('../middlewares/auth')
const path = require('path')
const multer = require('multer')
const { body, validationResult } = require('express-validator')

// 驗證有沒有登入
router.use(loginCheckMiddleware)

// 取得寵物資料
router.get('/', async (req, res) => {
  let data = await connection.queryAsync(
    'SELECT id, name, gender, birthday, information, image FROM pet WHERE member_id = ? AND deleted_time IS NULL',
    [req.session.member.id]
  )

  if (data.length > 0) {
    console.log(data)
    res.json(data)
  } else {
    res.status(404).send('Not Found')
  }
})

// 刪除寵物資料
router.post('/deletePet', async (req, res) => {
  console.log('req,body', req.body.id)
  let data = await connection.queryAsync(
    `UPDATE pet SET deleted_time= ? WHERE id= ?`,
    [moment().format('YYYY/MM/DD HH:mm:ss'), req.body.id]
  )
  res.json({ code: '4001', message: '寵物資料刪除成功' })
})

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'public', 'petImg'))
  },
  filename: function (req, file, cb) {
    console.log('filename', file)
    // 取出副檔名
    const ext = file.originalname.split('.').pop()
    cb(null, `pet-${Date.now()}.${ext}`)
  },
})

const petImg = multer({
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

// 新增寵物資料
router.post('/insertPet', petImg.single('image'), async (req, res) => {
  console.log('req,body', req.body)
  console.log('req,file', req.file)

  if (req.file) {
    let filename = req.file ? '/petImg/' + req.file.filename : ''
    let data = await connection.queryAsync(
      `INSERT INTO pet (member_id, name, gender, birthday, information, image, created_time) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.member.id,
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.information,
        filename,
        moment().format('YYYY/MM/DD HH:mm:ss'),
      ]
    )
  } else {
    let data = await connection.queryAsync(
      `INSERT INTO pet (member_id, name, gender, birthday, information, created_time) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.session.member.id,
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.information,
        moment().format('YYYY/MM/DD HH:mm:ss'),
      ]
    )
  }
  res.json({ code: '4000', message: '寵物資料新增成功' })
})

// 更新寵物資料
router.post('/updatePet', petImg.single('image'), async (req, res) => {
  console.log('req,body', req.body)
  console.log('req,file', req.file)

  if (req.file) {
    let filename = req.file ? '/petImg/' + req.file.filename : ''
    let data = await connection.queryAsync(
      `UPDATE pet SET name= ?, gender= ?, birthday= ?, information= ?, image=? WHERE id= ?`,
      [
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.information,
        filename,
        req.body.id,
      ]
    )
  } else {
    let data = await connection.queryAsync(
      `UPDATE pet SET name= ?, gender= ?, birthday= ?, information= ? WHERE id= ?`,
      [
        req.body.name,
        req.body.gender,
        req.body.birthday,
        req.body.information,
        req.body.id,
      ]
    )
  }
  res.json({ code: '4001', message: '寵物資料更新成功' })
})

module.exports = router
