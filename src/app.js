const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const morgan = require('morgan')
const axios = require('axios')
const dom_parser = require('dom-parser')

app.use(cors())
//app.use(express.static('build'))
app.use(express.json())
app.use(morgan(middleware.tinyLogger))

const base_url = 'https://bad-api-assignment.reaktor.com/v2'

//const old_api = require('./old_api')

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
  //console.log(end_url)
  const request = axios.get(`${base_url}/${end_url}`, {
    headers: { 'x-error-modes-active': 'all'}
  })
  return end_url.startsWith('products') ? 
    request.then(res => {
      console.log(end_url)
      return res.data
    }) :
    request.then(res => {
      console.log(end_url)
      return res
    })
}

const set_up_api = async () => {
  console.log('start of api load')
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

  /*availabilities = await all_manufactures_arr.map( async (manufacturer) => {
    //console.log(manufacturer)
    return await get_from_old_api(`availability/${manufacturer}`)
  })*/

  console.log('availabilities search done')
  availabilities.forEach(a => console.log(typeof(a)))
  //await Promise.all(availabilities)
  //console.log(availabilities)

  all_products_map = new Map()
  all_products.forEach(p => {
    all_products_map.set(p.id, {...p, availability: 'empty'})
    //console.log(all_products_map.get(p.id))
  })
  const re = /<INSTOCKVALUE>(.*)<\/INSTOCKVALUE>/
  let idx = 0
  availabilities.forEach(manufacturer => {
    manufacturer.forEach(product => {
      if (all_products_map.has(product.id.toLowerCase())) {
        const regex_res = product.DATAPAYLOAD.match(re)
        all_products_map.get(product.id.toLowerCase()).availability = regex_res[1]
      }
    })
  })

  all_products = [...all_products_map.values()]

  console.log('end of api load')
}



set_up_api()


/*setInterval(() => {
    axios.get(`${base_url}/v2/products/facemasks`)
    .then(res => {
        if (idx % 2 === 0) facemasks = res.data
        else facemasks = [{
            id: "4c2e07114f3e034937d",
            type: "facemasks",
            name: "NYGINFOL LIGHT",
            color: [
            "green"
            ],
            price: 32,
            manufacturer: "juuran"
        }]
        
        console.log('facemasks set up')
    }).catch(error => {
        console.log('error', error.message)
    })  
    //console.log(facemasks)
    idx++
    console.log('idx', idx)


}, 10000);*/


app.get('/', (request, response) => {
  response.send('<h1>Hello Reaktor</h1>')

})

app.get(`/api/products`, (request, response) => {
  console.log(all_products.length)
  response.json(all_products)
})

app.get(`/api/products/facemasks`, (request, response) => {
  const result = all_products.filter(p => p.type === 'facemasks')
  response.json(result)
})

app.get(`/api/products/gloves`, (request, response) => {
  const result = all_products.filter(p => p.type === 'gloves')
  response.json(result)
})

app.get(`/api/products/beanies`, (request, response) => {
  const result = all_products.filter(p => p.type === 'beanies')
  response.json(result)
})

app.use(middleware.unkownEndpoint)
app.use(middleware.errorHandler)

module.exports = app