module.exports = {
  loginCheckMiddleware: function (req, res, next) {
    if (req.session.member) {
      // 有member而且不是null
      // res.json(req.session.member)
      next()
    } else {
      // 沒有member or member是null
      return res.json({ code: '1201', message: '尚未登入' })
    }
  },
}
