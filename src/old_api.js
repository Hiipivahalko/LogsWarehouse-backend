const axios = require('axios')
const base_url = 'https://bad-api-assignment.reaktor.com'


const get_products = (product) => {

}

const get_availability = (manufaturer) => {
  axios.get(`${base_url}/v2/availability/${manufaturer}`)
    .then(res => {
      console.log(res)
    }).catch(error => {
      console.log('error', error.message)
    })
}

exports.get_products = get_products
exports.get_availability = get_availability

