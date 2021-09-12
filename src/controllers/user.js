const { user } = require('../../models')

const failed = (res, message, status) => {
    const responseCode = status ? status : 500

    return res.status(responseCode).send({
        status: 'failed',
        message: message,
    })
}

exports.getUsers = async (req, res) => {
    try {
        const query = {
            attributes: {
                exclude: ['password', 'createdAt', 'updatedAt'],
            },
        }
        const { limit, offset, status } = req.query

        if (limit) query.limit = parseInt(limit)
        if (offset) query.offset = parseInt(offset)
        if (status) query.where = { status: status }

        const result = await user.findAll(query)

        res.send({
            status: 'success',
            data: {
                users: result,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params

        if (req.user.id !== parseInt(id) && req.user.role !== 'admin') return failed(res, 'Access Denied')

        await user.update(
            {
                status: 'disabled',
            },
            {
                where: { id },
            }
        )

        res.send({
            status: 'success',
            data: {
                id: id,
            },
        })
    } catch (error) {
        return failed(res, 'Server Error')
    }
}
