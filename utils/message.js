

export const errorMessage = (
  res,
  status = 400,
  msg,
  ...anyError
) => {
  return res.status(status).json({
    response: {
      status: 'error',
      message: msg,
      ...anyError,
    },
  });
};

export const successMessage = (
  res,
  status = 200,
  msg,
  ...anySuccess
) => {
  return res.status(status).json({
    response: {
      status: 'success',
      message: msg,
      ...anySuccess,
    },
  });
};
