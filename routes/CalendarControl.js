const express = require('express')
const router = express.Router()
const connection = require('./connection')
const Event = require('../routes/models/event')
const moment = require('moment')

// router.post('/create-event', async (req, res) => {
//   const event = Event(req.body)
//   await event.save()
//   res.sendStatus(200)
// })

// router.get('/get-events', async (req, res) => {
//   const events = await Event.find({
//     start: { $gte: moment(req.query.start).toDate() },
//     end: { $slt: moment(req.query.end).toDate() },
//   })
// })
// module.exports = router
//連線之後找尋資料，找到資料姪丟回
//query.start\query.end=哇event的值
//
