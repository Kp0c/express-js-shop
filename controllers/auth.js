exports.getLogin = (req, res) => {
  res.render('auth/login', {
    title: 'Login',
    path: '/login',
    isAuthenticated: !!req.session.userId
  });
}

exports.postLogin = async (req, res) => {
  req.session.userId = '62a45b086591990a7263fa8d';
  await req.session.save();

  res.redirect('/');
}

exports.postLogout = async (req, res) => {
  await req.session.destroy();

  res.redirect('/');
}
