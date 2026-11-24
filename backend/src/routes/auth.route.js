const express = require('express')
const {login,logout} = require('../controllers/auth.controller')
const authMiddleware = require('../middlewares/auth.middleware')


const router = express.Router()



router.post('/login',login)
router.post('/logout', authMiddleware, logout);



module.exports = router;