const express = require('express')
const {createUser,getAllUser,getUser} = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const roleMiddleware = require('../middlewares/role.middleware')

const router = express.Router()



router.post('/createUser',authMiddleware,roleMiddleware("Admin"),createUser)
router.get('/getAllUser',authMiddleware,roleMiddleware("Admin"),getAllUser)
router.get('/getUser/:id',authMiddleware,roleMiddleware("Admin"),getUser)


module.exports = router;

