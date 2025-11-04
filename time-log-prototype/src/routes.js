const express = require('express')
const router = express.Router()
const { getPool } = require('./db')
const { generateToken, findUserByUsername, verifyPassword, authMiddleware } = require('./auth')

// login
router.post('/auth/login', async (req, res) => {
  const { username, password } = req.body
  if(!username || !password) return res.status(400).json({error:'username and password required'})
  const user = await findUserByUsername(username)
  if(!user) return res.status(401).json({error:'invalid credentials'})
  if(!verifyPassword(password, user.passwordHash)) return res.status(401).json({error:'invalid credentials'})
  const token = generateToken(user)
  res.json({token, user:{id:user.id, username:user.username, name:user.name, role:user.role}})
})

// create task (hr or reviewer or employee can create)
router.post('/tasks', authMiddleware, async (req, res) => {
  const { title, description } = req.body
  if(!title) return res.status(400).json({error:'title required'})
  const p = await getPool()
  const [r] = await p.execute('INSERT INTO tasks (title, description, created_by) VALUES (?, ?, ?)', [title, description || null, req.user.id])
  const [taskRows] = await p.execute('SELECT * FROM tasks WHERE id = ?', [r.insertId])
  res.status(201).json({task: taskRows[0]})
})

// assign task to employee (hr or reviewer or creator can assign)
router.post('/tasks/:id/assign', authMiddleware, async (req, res) => {
  const taskId = req.params.id
  const { user_id } = req.body
  if(!user_id) return res.status(400).json({error:'user_id required'})
  const p = await getPool()
  await p.execute('INSERT INTO task_assignments (task_id, user_id, assigned_by) VALUES (?, ?, ?)', [taskId, user_id, req.user.id])
  res.json({ok:true})
})

// punch in/out (optionally with task_id)
router.post('/punch', authMiddleware, async (req, res) => {
  const { task_id, action, notes } = req.body
  if(!action || !['IN','OUT'].includes(action)) return res.status(400).json({error:'action must be IN or OUT'})
  const p = await getPool()
  const ts = new Date().toISOString().slice(0,19).replace('T',' ') // MySQL DATETIME
  const [r] = await p.execute('INSERT INTO logs (user_id, task_id, action, timestamp, notes) VALUES (?, ?, ?, ?, ?)', [req.user.id, task_id || null, action, ts, notes || null])
  const [rows] = await p.execute('SELECT l.*, u.username, u.name, t.title as task_title FROM logs l JOIN users u ON u.id = l.user_id LEFT JOIN tasks t ON t.id = l.task_id WHERE l.id = ?', [r.insertId])
  res.status(201).json({log: rows[0]})
})

// get logs: employees see their own; hr/reviewer can see all or filter
router.get('/logs', authMiddleware, async (req, res) => {
  const p = await getPool()
  const { user } = req
  const { user_id, from, to } = req.query
  const filters = []
  const params = []
  if(user.role === 'employee'){
    filters.push('l.user_id = ?'); params.push(user.id)
  } else if(user_id){ filters.push('l.user_id = ?'); params.push(user_id) }
  if(from){ filters.push('l.timestamp >= ?'); params.push(new Date(from).toISOString().slice(0,19).replace('T',' ')) }
  if(to){ filters.push('l.timestamp <= ?'); params.push(new Date(to).toISOString().slice(0,19).replace('T',' ')) }
  const where = filters.length ? ('WHERE ' + filters.join(' AND ')) : ''
  const [rows] = await p.execute(`SELECT l.*, u.username, u.name, t.title as task_title FROM logs l JOIN users u ON u.id = l.user_id LEFT JOIN tasks t ON t.id = l.task_id ${where} ORDER BY l.timestamp DESC`, params)
  res.json({logs: rows})
})

// get tasks assigned to a user
router.get('/tasks', authMiddleware, async (req, res) => {
  const p = await getPool()
  const { user } = req
  // if employee -> return tasks assigned to them; else optionally filter by user_id
  const targetUser = (user.role === 'employee') ? user.id : (req.query.user_id || null)
  if(targetUser){
    const [rows] = await p.execute(`SELECT t.*, ta.assigned_at, ta.user_id FROM tasks t JOIN task_assignments ta ON ta.task_id = t.id WHERE ta.user_id = ? ORDER BY ta.assigned_at DESC`, [targetUser])
    return res.json({tasks: rows})
  }
  // otherwise list all tasks
  const [all] = await p.execute('SELECT * FROM tasks ORDER BY created_at DESC')
  res.json({tasks: all})
})

// list employees (hr only)
router.get('/employees', authMiddleware, async (req, res) => {
  if(req.user.role !== 'hr') return res.status(403).json({error:'forbidden'})
  const p = await getPool()
  const [rows] = await p.execute('SELECT id, username, name, role FROM users')
  res.json({employees: rows})
})

module.exports = router
