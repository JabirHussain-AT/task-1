const express = require('express')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT


// server listening on PORT 
app.listen(PORT, ( )=>{
    console.log( `Server is running at ${ PORT }`)
})
