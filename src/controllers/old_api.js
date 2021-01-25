const base_url = 'https://bad-api-assignment.reaktor.com/v2'
const axios = require('axios')
const logger = require('../utils/logger')
const config = require('../utils/config')
require('express-async-errors')


const sort_data_by_name = (a,b) => {
  try {
    if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
    else if (a.name.toLowerCase() > b.name.toLowerCase()) 1
  } catch (exeption) {
    console.log(a, b)
    console.log(exeption.message)
  }
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

const fetch_products = async (product_types) => {
  let products = []

  for (let type of product_types) {
    const data = await get_from_old_api(`products/${type}`)
    products = products.concat(data)
  }

  products.sort(sort_data_by_name)
  return products
}

const fetch_availabilities = async (products) => {

  if (!products || products.length === 0) {
    logger.error('Something went wrong products were null or length of 0')
    logger.error(products, '\n-----------')
    return []
  }

  const all_manufactures = products.reduce((res, next) => res.add(next.manufacturer), new Set())
  const availabilities = []
  
  for (let m of all_manufactures) {
    while(true) {
      const next_availability = await get_from_old_api(`availability/${m}`)
      if (next_availability.headers['x-error-modes-active'] !== 'availability-empty') {
        availabilities.push(next_availability.data.response)
        break
      }
      logger.error(`could not fetch data from availability/${m}`)
    }
  }
  return availabilities
}

const merge_products_availability = (products, availabilities) => {
  logger.info('processing data')
  
  const all_products_map = new Map()
  products.forEach(p => {
    all_products_map.set(p.id.toLowerCase(), {...p, availability: 'empty'})
  })

  const RE = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
  availabilities.forEach(manufacturer => {
    manufacturer.forEach(product => {
      if (all_products_map.has(product.id.toLowerCase())) {
        try {
          const regex_res = product.DATAPAYLOAD.match(RE)
          all_products_map.get(product.id.toLowerCase()).availability = regex_res[1]
        } catch (exception) {
          logger.error(exception.message)
        }
      }
    })
  })

  const all_products = [...all_products_map.values()]
  const beanies = all_products.filter(p => p.type === 'beanies')
  const facemasks = all_products.filter(p => p.type === 'facemasks')
  const gloves = all_products.filter(p => p.type === 'gloves')

  logger.info('data processing end')
  return all_products 
}

const set_up_api = async (prod_types) => {
  logger.info('start of api load')

  const products = await fetch_products(prod_types)
  const availabilities = await fetch_availabilities(products)

  logger.info('end of api load')

  const all_products = merge_products_availability(products, availabilities)
  const result_data = {}
  prod_types.forEach(type => {
    result_data[type] = all_products.filter(product => product.type === type)
  })

  return result_data
}

module.exports = set_up_api

