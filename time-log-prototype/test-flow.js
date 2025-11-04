require('dotenv').config()
const fetch = require('node-fetch')
const base = 'http://localhost:3000/api'

async function login(username, password){
  const r = await fetch(base + '/auth/login', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({username,password})})
  return r.json()
}

async function createTask(token, title, description){
  const r = await fetch(base + '/tasks', {method:'POST', headers:{'content-type':'application/json','authorization':'Bearer '+token}, body: JSON.stringify({title,description})})
  return r.json()
}

async function assignTask(token, taskId, userId){
  const r = await fetch(base + `/tasks/${taskId}/assign`, {method:'POST', headers:{'content-type':'application/json','authorization':'Bearer '+token}, body: JSON.stringify({user_id: userId})})
  return r.json()
}

async function punch(token, action, taskId){
  const r = await fetch(base + '/punch', {method:'POST', headers:{'content-type':'application/json','authorization':'Bearer '+token}, body: JSON.stringify({action, task_id: taskId})})
  return r.json()
}

async function logs(token){
  const r = await fetch(base + '/logs', {headers:{'authorization':'Bearer '+token}})
  return r.json()
}

async function run(){
  console.log('Login as hr1...')
  const lhr = await login('hr1','hrpass')
  console.log(lhr)
  const hrToken = lhr.token

  console.log('Create a task...')
  const ct = await createTask(hrToken, 'Follow up with client', 'Call client about contract')
  console.log(ct)

  console.log('Assign task to employee1...')
  await assignTask(hrToken, ct.task.id, 1)

  console.log('Login as employee1...')
  const le = await login('employee1','employeepass')
  console.log(le)
  const eToken = le.token

  console.log('Punch IN for task 1...')
  console.log(await punch(eToken, 'IN', 1))
  console.log('Punch OUT for task 1...')
  console.log(await punch(eToken, 'OUT', 1))

  console.log('Fetch logs (employee view)')
  console.log(await logs(eToken))
}

run().catch(e=>console.error(e))
