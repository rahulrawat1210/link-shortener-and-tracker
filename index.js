const mongoose = require('mongoose')
const express = require('express')
const app = express()
const path = require('path')

app.listen(3000,function(){
    console.log('Server started on port 3000')
})

app.use(express.static(path.join(__dirname, 'public')))


