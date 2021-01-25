require('dotenv').config()

let PORT = process.env.PORT

let PRODUCT_TYPES = ['beanies', 'facemasks', 'gloves']

module.exports = {
  PORT,
  PRODUCT_TYPES
}