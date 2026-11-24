const express = require('express')
const authRoute = require('../src/routes/auth.route')
const createAdmin =require('../src/utils/createAdmin')
const userRoute = require('../src/routes/user.route')



const app = express()
createAdmin()

app.use(express.json());
app.use('/api/auth/',authRoute)
app.use('/api/user/',userRoute)


module.exports = app