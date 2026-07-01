export const checkAuth = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  }
  res.status(200).json({
    success: true,
    message: "User is authenticated",
    user: req.user,
  });
};
