require('dotenv').config()

const express = require('express')

const apiVer = 2

const app = express()

const port = 5000

const router = require(`./src/v${apiVer}/routes`)

const cors = require('cors')

app.use(express.json())

app.use(cors())

app.use(`/api/v${apiVer}`, router)

app.use('/uploads', express.static('uploads'))

app.use('/api', express.static('api'))

app.listen(port, () => console.log('Listening on port ' + port))
