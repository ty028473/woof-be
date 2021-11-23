const mysql = require('mysql')
const Promise = require('bluebird')

let connection = mysql.createConnection({
  host: process.env.host,
  port: process.env.port,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
  dateStrings: true,
})

connection = Promise.promisifyAll(connection)
console.log('加到嗎', process.env.host)

module.exports = connection
