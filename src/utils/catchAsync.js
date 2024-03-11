module.exports = (fn, errFn = () => null) => {
  return (req, res, next) => {
    fn(req, res, next).catch((err) => {
      errFn(req, res);
      next(err);
    });
  };
};
