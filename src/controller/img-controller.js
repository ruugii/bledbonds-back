const multer = require('multer')
const fs = require('fs')
const createLog = require('../functions/createLog')

// information about multer storage: https://www.npmjs.com/package/multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/img/')
  },
  filename: function (req, file, cb) {
    const extension = file.mimetype.split('/')[1]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + extension)
  }
})

// information about multer upload: https://www.npmjs.com/package/multer
const uploadMid = multer({ storage: storage })

// Controller for uploading images
const uploadControll = async (req, res) => {
  uploadMid.single('image')
  const file = req.file
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
  const link = `https://api.bledbonds.es/img/${uniqueSuffix + '.' + file.mimetype.split('/')[1]}`
  await renameFile('public/img/', file.filename, uniqueSuffix + '.' + file.mimetype.split('/')[1])
  createLog(0, 'uploadControll img-controller - 27', `Subida de imagen ${file.filename}`)
  res.status(200).json({
    message: 'File uploaded successfully',
    filename: uniqueSuffix + '.' + file.mimetype.split('/')[1],
    url: link
  })
}

// Controller for deleting images
async function deleteControll (req, res) {
  const { url } = req.body
  const path = 'public/img/'
  const name = url.split('/')[4]
  if (fs.existsSync(path + name)) {
    fs.unlink(url, function (err) {
      if (err) {
        createLog('', 'deleteControll img-controller - 43', err)
        throw err
      } else {
        createLog(0, 'deleteControll img-controller - 46', `Eliminación de imagen ${name}`)
        res.status(200).json({
          message: 'File deleted successfully'
        })
      }
    })
  }
}

// Controller for renaming images
async function renameFile (path, oldName, newName) {
  if (fs.existsSync(path + oldName)) {
    fs.rename(path + oldName, path + newName, function (err) {
      if (err) throw err
    })
  }
}

module.exports = {
  uploadControll,
  deleteControll
}
