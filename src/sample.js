//const fetch = require('fetch')

const base_url = 'https://bad-api-assignment.reaktor.com/v2'

/*fetch('https://bad-api-assignment.reaktor.com/v2/products')
    .then(res => {
        console.log(res.data)
    })
    .catch(error => {
        console.log('error:', error.message)
    })*/

const axios = require('axios')

const sort_data_by_name = (a, b) => {
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  else if (a.name.toLowerCase() > b.name.toLowerCase()) 1
  return 0
}

let facemasks = []
let gloves = []
let beanies = []
let all_products = []

const get_from_old_api = (end_url, prods) => {
  const request = axios.get(`${base_url}/${end_url}`)
  request.then(res => {
    res.data.forEach(p => prods.set(p.id, p))
    return prods
  })
    .catch(error => console.error(error.message))
}

let s;

const set_up_api = async () => {
  let m = new Map()
  m = await get_from_old_api('products/facemasks', m)
  console.log(typeof (m))
  console.log(m.size)
  m = await get_from_old_api('products/gloves', m)
  console.log(m.size)
  m = await get_from_old_api('products/beanies', m)
  console.log(m.size)
  //all_products = facemasks.concat(gloves, beanies).sort(sort_data_by_name)



}

//set_up_api()



/*axios.get(`${base_url}/v2/products/facemasks`)
    .then(res => {
        console.log(res)
    })
    .catch(error => {
        console.log('error', error.message)
    })*/

axios.get(`${base_url}/availability/juuran`, {
  headers: { 'x-error-modes-active': 'availability-empty' }
}).then(res => {
  console.log(res)

})

const p = {
  id: '8e8637119f14fd894c',
  type: 'gloves',
  name: 'AKDAL BANG EARTH',
  color: ['yellow'],
  price: 89,
  manufacturer: 'abiplos'
}

const x = { ...p, test: 'this is also included' }

//console.log(x)