const express = require('express')
const router = express.Router()
const connection = require('./connection')

router.get('/', async (req, res) => {
  let data = await connection.queryAsync('SELECT FROM member WHERE id = ?', [
    1,
  ])

  if (data.length > 0) {
    res.json(data[0])
    console.log(data)
  } else {
    res.status(404).send('Not Found')
  }
})

router.post('/auth', (req, res) => {})

module.exports = router
