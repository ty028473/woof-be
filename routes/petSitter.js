const express = require('express')
const router = express.Router()
const connection = require('./connection')
const { loginCheckMiddleware } = require('../middlewares/auth')

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
module.exports = router
