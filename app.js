const express = require('express')

const path = require('path')

const dbPath = path.join(__dirname, 'todoApplication.db')

const {open} = require('sqlite')

const sqlite3 = require('sqlite3')

const app = express()

app.use(express.json())

module.exports = app

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({filename: dbPath, driver: sqlite3.Database})
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error:${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

//GET list Todos API-1
app.get('/todos/', async (request, response) => {
  let data = null
  let getTodoQuery = ''
  const {search_q = '', priority, status} = request.query

  const hasPriorityAndStatusProperties = requestQuery => {
    return (
      requestQuery.priority !== undefined && requestQuery.status !== undefined
    )
  }

  const hasPriorityProperty = requestQuery => {
    return
    requestQuery.priority !== undefined
  }

  const hasStatusProperty = requestQuery => {
    return
    requestQuery.status !== undefined
  }

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}' AND priority='${priority}';`
      break
    case hasPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority='${priority}';`
      break

    case hasStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status='${status}';`
      break
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%'; `
  }

  data = await db.all(getTodoQuery)
  response.send(data)
})

//GET Todo API-2
app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`
  const todoObj = await db.get(getTodoQuery)
  response.send(todoObj)
})

//POST Todo API-3
app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const addTodoQuery = `INSERT INTO todo(id,todo,priority,status) VALUES(${id},'${todo}','${priority}','${status}');`
  const newTodo = db.run(addTodoQuery)
  response.send('Todo Successfully Added')
})

//PUT Todo API-4
app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updatedColumn = ''
  const requestBody = request.body

  switch (true) {
    case requestBody.status != undefined:
      updatedColumn = 'Status'
      break

    case requestBody.priority != undefined:
      updatedColumn = 'Priority'
      break

    case requestBody.todo != undefined:
      updatedColumn = 'Todo'
      break
  }

  const previousTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`
  const previousTodo = await db.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    status = previousTodo.status,
    priority = previousTodo.priority,
  } = requestBody

  const updatedTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}' WHERE id=${todoId};`
  await db.run(updatedTodoQuery)
  response.send(`${updatedColumn} Updated`)
})

//Delete todo API-5
app.delete('/todo/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodo = `DELETE FROM todo WHERE id=${todoId};`
  const dataupdate= await db.run(deleteTodo)
  response.send('Todo Deleted')
})
