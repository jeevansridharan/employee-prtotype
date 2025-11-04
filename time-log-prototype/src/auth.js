const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { getPool } = require('./db')

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

function generateToken(user){
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '8h' })
}

async function findUserByUsername(username){
  const p = await getPool()
  const [rows] = await p.execute('SELECT id, username, name, password_hash AS passwordHash, role FROM users WHERE username = ?', [username])
  return rows[0]
}

function verifyPassword(plain, hash){
  return bcrypt.compareSync(plain, hash)
}

function authMiddleware(req, res, next){
  const h = req.headers.authorization
  if(!h || !h.startsWith('Bearer ')) return res.status(401).json({error:'missing token'})
  const token = h.slice(7)
  try{
    const payload = jwt.verify(token, JWT_SECRET)
    req.user = payload
    next()
  } catch(err){
    return res.status(401).json({error:'invalid token'})
  }
}

module.exports = { generateToken, findUserByUsername, verifyPassword, authMiddleware }
