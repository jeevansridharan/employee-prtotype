require('dotenv').config()
const bcrypt = require('bcryptjs')
const { getPool, init } = require('./src/db')

async function upsertUser(username, name, password, role){
  const p = await getPool()
  const hash = bcrypt.hashSync(password, 8)
  const [rows] = await p.execute('SELECT id FROM users WHERE username = ?', [username])
  if(rows.length){
    await p.execute('UPDATE users SET name=?, password_hash=?, role=? WHERE id=?', [name, hash, role, rows[0].id])
    return rows[0].id
  }
  const [r] = await p.execute('INSERT INTO users (username, name, password_hash, role) VALUES (?, ?, ?, ?)', [username, name, hash, role])
  return r.insertId
}

async function run(){
  await init()
  const alice = await upsertUser('employee1','Alice Employee','employeepass','employee')
  const bob = await upsertUser('employee2','Bob Employee','bobpass','employee')
  const hr = await upsertUser('hr1','Hannah HR','hrpass','hr')
  const rev = await upsertUser('reviewer1','Ron Reviewer','revpass','reviewer')

  const p = await getPool()
  // create a sample task
  const [t] = await p.execute('INSERT INTO tasks (title, description, created_by) VALUES (?, ?, ?)', ['Prepare report', 'Monthly sales report', hr])
  // assign to Alice
  await p.execute('INSERT INTO task_assignments (task_id, user_id, assigned_by) VALUES (?, ?, ?)', [t.insertId, alice, hr])

  console.log('Seeded users and one sample task assigned to employee1')
}

run().catch(e=>{ console.error(e); process.exit(1) })
