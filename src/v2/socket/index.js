const { models } = require('../functions')

const { user } = models

let userCount = 0

const socketIo = (io) => {
    io.on('connection', (socket) => {
        let count = 0
        userCount += 1
        console.log('client connected')
        socket.emit('user', userCount)

        socket.on('load admin contact', async () => {
            try {
                const adminContact = user.findOne({
                    where: {
                        status: 'admin',
                    },
                    attributes: ['id', 'fullName', 'image'],
                })
                socket.emit('admin contact', adminContact)
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('count', () => {
            count += 1
            console.log(count, socket.id)
        })

        socket.on('load customer contact', async () => {
            try {
                const contact = await user.findAll({
                    attributes: ['id', 'fullName', 'image'],
                })
                socket.emit('customer contact', contact)
            } catch (error) {
                console.log(error)
            }
        })

        socket.on('disconnect', () => {
            console.log('client disconnect')
            userCount -= 1
            socket.emit('user', userCount)
        })
    })
}

module.exports = socketIo
