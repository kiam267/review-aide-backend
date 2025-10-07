

const UserValidation = schema => async (req, res, next) => {
  try {
    await schema.parseAsync(req.body);
    next();
  } catch (err) {
    res.json({msg : err});
  }
};

module.exports = UserValidation;
