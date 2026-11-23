const app = require('./src/app')
require('dotenv').config()
const connectdb = require('./src/db/db')


const PORT = process.env.PORT || 3001


app.listen(PORT, async => {
    try {
        console.log(`Server running on port ${PORT}`);
    }
    catch (err) {
        console.log('Server Connection Failed ', err)
    }

})


connectdb()