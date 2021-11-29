const connection = require('./connection')

const EventSchema = connection.Schema({
  start: Date,
  end: Date,
  title: String,
  pet_sitter_id: String,
  district: String,
})
const Event = connection.model('Event', EventSchema)

module.exports = Event
