const productRouter = require('express').Router()
const base_url = 'https://bad-api-assignment.reaktor.com/v2'
const axios = require('axios')
const logger = require('../utils/logger')
require('express-async-errors')

let facemasks = []
let gloves = []
let beanies = []
let all_products = []
let all_manufactures = new Set()
let availabilities = []

const sort_data_by_name = (a,b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  else if (a.name.toLowerCase() > b.name.toLowerCase()) 1
  return 0
}

const get_from_old_api = (end_url) => {
  logger.info('fetching data from old api:', `${base_url}/${end_url}`)
  const request = axios.get(`${base_url}/${end_url}`, {
    headers: { 'x-error-modes-active': ''}
  })
  return end_url.startsWith('products') ? 
    request.then(res => res.data) :
    request.then(res => res)
}

const set_up_api = async () => {
  logger.info('start of api load')
  facemasks = await get_from_old_api('products/facemasks')
  gloves = await get_from_old_api('products/gloves')
  beanies = await get_from_old_api('products/beanies')
  all_products = facemasks.concat(gloves, beanies).sort(sort_data_by_name)

  all_manufactures = all_products.reduce((res, next) => res.add(next.manufacturer), new Set())
  const all_manufactures_arr = [...all_manufactures]
  for (let m of all_manufactures) {
    let next_availability;
    while(true) {
      next_availability = await get_from_old_api(`availability/${m}`)
      if (next_availability.headers['x-error-modes-active'] !== 'availability-empty') {
        availabilities.push(next_availability.data.response)
        break
      }

    }
  }

  all_products_map = new Map()
  all_products.forEach(p => {
    all_products_map.set(p.id.toLowerCase(), {...p, availability: 'empty'})
  })
  const re = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
  availabilities.forEach(manufacturer => {
    manufacturer.forEach(product => {
      if (all_products_map.has(product.id.toLowerCase())) {
        const regex_res = product.DATAPAYLOAD.match(re)
        all_products_map.get(product.id.toLowerCase()).availability = regex_res[1]
      }
    })
  })

  all_products = [...all_products_map.values()]

  logger.info('end of api load')
}

set_up_api()


productRouter.get(`/`, async (request, response, next) => {
  console.log(all_products.length)
  response.json(all_products)
})

productRouter.get(`/facemasks`, async (request, response, next) => {
  const result = all_products.filter(p => p.type === 'facemasks')
  response.json(result)
})

productRouter.get(`/gloves`, async (request, response, next) => {
  const result = all_products.filter(p => p.type === 'gloves')
  response.json(result)
})

productRouter.get(`/beanies`, async (request, response, next) => {
  const result = all_products.filter(p => p.type === 'beanies')
  response.json(result)
})

module.exports = productRouter