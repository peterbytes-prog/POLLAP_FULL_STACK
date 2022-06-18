const response = (req, res, error) => {
  res.status = 400;
  res.setHeader('Content-Type', 'application/json');
  error = error || new Error('Invalid Request');
  return res.json({message: error.message})
}

module.exports = response;
