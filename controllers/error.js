exports.notFoundController = (req, res) => {
  res.status(404).render('404', {
    title: 'Not found',
    path: null,
    isAuthenticated: !!req.session.userId
  });
};
