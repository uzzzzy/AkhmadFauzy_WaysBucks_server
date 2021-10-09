const { models, success, failed } = require('../functions/')

const { user: table } = models

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

exports.login = async (req, res) => {
    try {
        const userExist = await table.findOne({
            where: {
                email: req.body.email,
            },
        })

        if (!userExist) failed(res, 'user not found', 400)

        const isValid = await bcrypt.compare(req.body.password, userExist.password)

        if (!isValid) failed(res, 'credential is invalid', 400)

        const token = jwt.sign(
            {
                id: userExist.id,
                role: userExist.status,
            },
            process.env.TOKEN
        )

        success(res, { token })
    } catch (error) {
        console.log(error)
        failed(res)
    }
}
