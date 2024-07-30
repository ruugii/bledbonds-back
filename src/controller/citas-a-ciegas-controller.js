const create = async (req, res) => {
  try {
    return res.status(200).json({
      message: 'we are working on it'
    })
  } catch (error) {
    res.status(500).json({
      message: 'Internal server error',
      error: error.message
    })
  }
}

module.exports = {
  create
}
