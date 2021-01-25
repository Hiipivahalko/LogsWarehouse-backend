const productRouter = require('express').Router()
const logger = require('../utils/logger')
const config = require('../utils/config')
const product_types = config.PRODUCT_TYPES
const set_up_api = require('./old_api')

let all_products = []

if (process.env.NODE_ENV === 'production') {
  setInterval( async () => {
    all_products = await set_up_api(product_types)
  }, (60 * 1000) * 5) // reload after 5 min
} else if (process.env.NODE_ENV === 'development') {
  console.log('dev mode data fetch')
  set_up_api(product_types).then(res => {
    all_products = res
  })
}

productRouter.get(`/`, async (request, response, next) => {
  response.json(all_products)
})

productRouter.get('/types', async (request, response, next) => {
  response.json(product_types)
})

productRouter.get(`/:type`, async (request, response, next) => {
  const type = request.params.type
  response.json(all_products[type])
})

module.exports = productRouter