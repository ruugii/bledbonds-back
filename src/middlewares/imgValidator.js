const fs = require('fs')

async function uploadImg (req, res, next) {
  const { file } = req
  if (!file) {
    return res.status(400).json({
      message: 'No file uploaded'
    })
  } else {
    if (file.mimetype !== 'image/png' && file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/jpg') {
      await deleteFile('public/img/', file.filename)
      return res.status(400).json({
        message: 'File type not supported'
      })
    } else {
      if (file.height < 100 || file.width < 100) {
        await deleteFile('public/img/', file.filename)
        return res.status(400).json({
          message: 'Image too small'
        })
      } else if (file.height > 1000 || file.width > 1000) {
        await deleteFile('public/img/', file.filename)
        return res.status(400).json({
          message: 'Image too big'
        })
      } else {
        next()
      }
    }
  }
}

async function deleteFile (path, name) {
  if (fs.existsSync(path + name)) {
    fs.unlink(path + name, function (err) {
      if (err) throw err
    })
  }
}

async function deleteImgValidation (req, res, next) {
  try {
    const { url } = req.body

    if (url.includes('random/')) {
      return res.status(200).json({
        message: 'No url provided'
      })
    } else {
      if (url.split('/')[4] !== 'random') {
        deleteFile('public/img/', url.split('/')[4])
        return res.status(200).json({
          message: 'File deleted successfully'
        })
      } else {
        return res.status(200).json({
          message: 'File deleted successfully'
        })
      }
    }
  } catch (err) {
    return res.status(400).json({
      message: 'Error deleting file',
      error: err
    })
  }
}

module.exports = {
  uploadImg,
  deleteImgValidation
}
