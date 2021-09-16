const multer = require('multer')

const sizeInMB = 10
const maxSize = sizeInMB * 1000 * 1000

const storageFun = multer.diskStorage({
    destination: function (req, file, cb) {
        const path = req.url.split('/')[1]
        cb(null, `uploads/${path}s`)
    },

    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname.replace(/\s/g, '')}`)
    },
})

const filterFn = (req, file, cb, imageFile) => {
    if (file.fieldname === imageFile) {
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = {
                message: 'Only image files are accepted',
            }

            return cb(new Error('Only image files are accepted'), false)
        }
    }
    cb(null, true)
}

const resData = (req, res, next, upload, opt) => {
    upload(req, res, function (err) {
        if (req.fileValidationError) {
            return res.status(400).send(req.fileValidationError)
        }

        if (!req.file && !err) {
            if (opt === 'update') return next()
            else
                return res.status(400).send({
                    message: 'Please select a image file to upload',
                })
        }

        if (err) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send({
                    message: 'File size exceeds limit',
                })
            }

            return res.status(400).send(err)
        }

        return next()
    })
}

exports.uploadFile = (imageFile) => {
    const storage = storageFun
    const fileFilter = (req, file, cb) => filterFn(req, file, cb, imageFile)

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
        },
    }).single(imageFile)

    return (req, res, next) => resData(req, res, next, upload)
}

exports.updateFile = (imageFile) => {
    const storage = storageFun
    const fileFilter = (req, file, cb) => filterFn(req, file, cb, imageFile)

    const upload = multer({
        storage,
        fileFilter,
        limits: {
            fileSize: maxSize,
        },
    }).single(imageFile)

    return (req, res, next) => resData(req, res, next, upload, 'update')
}
