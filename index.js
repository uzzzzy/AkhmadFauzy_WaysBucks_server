require('dotenv').config()

const http = require('http')
const { Server } = require('socket.io')

const express = require('express')

const apiVer = 2

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
    },
})

require('./src/v2/socket')(io)

const port = 5000

const router = require(`./src/v${apiVer}/routes`)

const cors = require('cors')

app.use(express.json())

app.use(cors())

app.use(`/api/v${apiVer}`, router)

app.use('/uploads', express.static('uploads'))

app.use('/api', express.static('api'))

server.listen(port, () => console.log('Listening on port ' + port))
