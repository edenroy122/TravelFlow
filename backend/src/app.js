const express = require('express')
const authRoute = require('../src/routes/auth.route')
const createAdmin =require('../src/utils/createAdmin')



const app = express()
createAdmin()

app.use(express.json());
app.use('/api/auth/',authRoute)



module.exports = app