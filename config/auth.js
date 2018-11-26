exports.isUser = function(req, res, next) {
  if (req.isAuthenticated()) {
    next();
  } else {
    req.flash('danger', 'Please log in!');
    res.redirect('/users/login');
  }
};