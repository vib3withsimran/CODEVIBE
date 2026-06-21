const { addToDenylist } = require('../../utils/tokenDenylist');

const logout = (req, res) => {
  const token = req.cookies?.accessToken || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (token) {
    addToDenylist(token);
  }
  
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  
  return res.status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = logout;