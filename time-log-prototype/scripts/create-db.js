require('dotenv').config()
const mysql = require('mysql2/promise')

async function run(){
  const host = process.env.DB_HOST || '127.0.0.1'
  const port = Number(process.env.DB_PORT || 3306)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASSWORD || ''
  const dbName = process.env.DB_NAME || 'time_log_prototype'

  try {
    const conn = await mysql.createConnection({host, port, user, password, connectTimeout: 3000})
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`)
    await conn.end()
    console.log(`Ensured database exists: ${dbName}`)
  } catch (err) {
    console.error('Failed to create database. Check MySQL is running and credentials in .env', err.message)
    process.exit(1)
  }
}

run().catch(err => { console.error(err); process.exit(1) })
