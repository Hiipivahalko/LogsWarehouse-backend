const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const morgan = require('morgan')
const productRouter = require('./controllers/products')

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(middleware.tinyLogger))


app.get('/HelloWorld', (request, response) => {
  response.send('<h1>Hello Reaktor</h1>')
})

app.use('/api/products', productRouter)

app.use(middleware.unkownEndpoint)
app.use(middleware.errorHandler)

module.exports = app