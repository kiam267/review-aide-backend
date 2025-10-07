const con = require('../utils/bd');
const { authErrorMessage } = require('../utils/error');
const uniqId = require('uniqid');
const { queueINIT } = require('../utils/redisbd');
const jwt = require('jsonwebtoken');
const {
  password_hash,
  comparePassword,
  token_generator,
  verifyToken,
} = require('../utils/utils');

const login = async (req, res) => {
  const { email, password, temporary } = req.body;
  try {
    const hasEmail =
      'SELECT * FROM users WHERE email = ? AND temporaray_lock = ?';
    con.query(hasEmail, [email, temporary], async (err, result) => {
      if (result.length === 0) {
        return res.json(
          authErrorMessage(
            'error',
            'This is not a valid email or temporary password'
          )
        );
      }
      const hasPassword = await comparePassword(password, result[0].password);

      if (!hasPassword) {
        return res.json(authErrorMessage('error', 'Password  mismatch'));
      }

      res.json({
        token: await token_generator({
          id: result[0].id,
          email: result[0].email,
          isAdmin: false,
        }),
        email: result[0].email,
        isValid: result[0].isValid,
        avater: result[0].phato_path,
        username: result[0].username,
        msg: {
          name: 'success',
        },
      });
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'Something went wrong'));
  }
};

const forgetPassword = (req, res) => {
  try {
    const { email, link } = req.headers;
    const queue = queueINIT('forget-password');

    const hasEmail = 'SELECT * FROM users WHERE email = ?';
    con.query(hasEmail, [email], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'Email invalid'));
      }
      const payload = {
        id: result[0].id,
        uniqId: result[0].uniqId,
        email: result[0].email,
      };
      console.log(result[0].password);
      const secret = process.env.VERIFY_SIGNATURE + result[0].password;
      const forget_token = await jwt.sign(payload, secret, {
        expiresIn: '15m',
      });
      const reset_link = `${link}/user/reset-password/${result[0].uniqueId}/${forget_token}`;
      console.log(reset_link);
      await queue.add(`forget-password`, {
        link: reset_link,
        email: result[0].email,
      });
      console.log('work');
      res.json(authErrorMessage('success', 'check email', { valid: true }));
    });
  } catch (error) {
    console.log('some rror happened');
  }
};

const resetPassword = (req, res) => {
  const { id, token } = req.headers;
  try {
    console.log(id);
    const hasEmail = 'SELECT * FROM users WHERE uniqueId = ?';
    con.query(hasEmail, [id], async (err, result) => {
      if (result === undefined) {
        return res.json(authErrorMessage('error', 'You  are not register'));
      }
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'Email Invalid'));
      }
      const secret = process.env.VERIFY_SIGNATURE + result[0].password;
      try {
        let payload = jwt.verify(token, secret);
        if (!payload) {
          return res.json(authErrorMessage('success', 'every think ok'));
        }
      } catch (error) {
        return res.json(
          authErrorMessage('error', 'You Have  Already Change Password', {
            valid: true,
          })
        );
      }
    });
  } catch (error) {
    console.log(error);
    // res.json(authErrorMessage('error', 'You Have  Already Change Password'));
  }
};
const postRestPassword = (req, res) => {
  const { id, password } = req.body;
  try {
    const ID = 'SELECT * FROM users WHERE uniqueId = ?';
    con.query(ID, [id], async (err, result) => {
      const sql = 'UPDATE users SET  password = ? WHERE uniqueId = ?';
      const hashPassword = await password_hash(password);
      console.log(result[0].uniqueId);
      con.query(
        sql,
        [hashPassword, result[0].uniqueId],
        async (err, result) => {
          res.json(authErrorMessage('success', 'Password changed'));
        }
      );
    });
  } catch (error) {
    console.log('getpasswords error');
    res.json(authErrorMessage('error', 'You Have  Already Change Password'));
  }
};

const create = (req, res) => {
  const { email, password, date } = req.body;
  try {
    const hasEmail = 'SELECT COUNT(*) AS count FROM users WHERE email = ?';
    con.query(hasEmail, [email], async (err, result) => {
      if (result[0].count > 0) {
        return res.json(authErrorMessage('error', 'Email already exists'));
      }
      const sql =
        'INSERT INTO users (email, password, date, fix_email) VALUES (?, ?, ?, ?)';
      const hash_password = await password_hash(password);
      con.query(sql, [email, hash_password, date, email], (err, result) => {
        if (err) throw err;
        return res.json(
          authErrorMessage('success', 'Users created successfully')
        );
      });
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'Server error '));
  }
};

// Update users Profile
const update = async (req, res) => {
  const {
    username,
    email,
    password,
    phone,
    companyName,
    google,
    facebook,
    temporary,
    date,
    token,
    editSms,
    editEmail,
  } = req.body;

  const { filename } = req.file;
  try {
    const isVarify = verifyToken(token);
    const hasEmail = 'SELECT * FROM users WHERE email = (?)';
    con.query(hasEmail, [isVarify.decoded.email], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'This is not a valid email'));
      }
      if (result[0].email === email) {
        return res.json(
          authErrorMessage('error', 'This email is already in the system.')
        );
      }

      // password hash
      const hashPassword = await password_hash(password);
      const sql =
        'UPDATE users SET email = ?, password = ?, username = ?, phone = ?, company_name = ?, google_link = ?, facebook_link = ?, isValid = ?, date = ?, temporaray_lock = ?, phato_path = ?,  uniqueId = ?, email_message = ? , sms_message= ?  WHERE id = ?';
      const upData = [
        email,
        hashPassword,
        username,
        phone,
        companyName,
        google,
        facebook,
        true,
        date,
        temporary,
        filename,
        uniqId(),
        editEmail,
        editSms,
        result[0].id,
      ];
      con.query(sql, upData, async (err, result) => {
        if (err) {
          return res.json(authErrorMessage('error', 'Could not update'));
        }
        const hasEmail = 'SELECT * FROM users WHERE email = (?)';
        con.query(hasEmail, [email], async (err, result) => {
          res.json({
            token: await token_generator({
              id: result[0].id,
              email: result[0].email,
            }),
            email: result[0].email,
            valid: true,
            isValid: result[0].isValid,
            avater: result[0].phato_path,
            username: result[0].username,
            msg: {
              name: 'success',
              msg: 'Successfully Update Your Profile',
            },
          });
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.json(authErrorMessage('error', 'Something went wrong'));
  }
};

//get All Usres
const getUsers = async (req, res) => {
  const token = req.headers.token;
  try {
    const isVerified = await verifyToken(token);
    const isAdmin = Boolean(Number(isVerified.decoded.isAdmin));
    if (!isAdmin) {
      return res.json(authErrorMessage('error', 'This problem'));
    }
    const sql =
      'SELECT uniqueId, username, email, phato_path, temporaray_lock, company_name, date, phone, facebook_link, google_link FROM users';
    con.query(sql, async (err, result) => {
      if (err) {
        return res.json(authErrorMessage('error', 'This problem'));
      }
      return res.json(authErrorMessage('success', 'ok', [...result]));
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'This problem'));
  }
};

// get single user
const getSingleUser = async (req, res) => {
  const token = req.headers.token;
  const isVerified = verifyToken(token);

  try {
    const hasEmail = 'SELECT * FROM users WHERE email = (?)';
    con.query(hasEmail, [isVerified.decoded.email], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'This is not a valid email'));
      }

      const sql = 'SELECT id, email, date, isValid FROM users WHERE email = ?';
      con.query(sql, [result[0].email], async (err, result) => {
        if (err) {
          return res.json({ error: 'Problem get all users' });
        }
        return res.json({
          email: result[0].email,
          username: result[0].username,
          id: result[0].id,
          isValid: result[0].isValid,
          valid: true,
        });
      });
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'This problem'));
  }
};

// DASHBOARD DATA
const getDashboadData = async (req, res) => {
  const token = req.headers.token;
  const isVerified = verifyToken(token);

  try {
    const hasEmail =
      'SELECT name, method, review_method FROM client_visitor WHERE user_email = (?)';
    con.query(hasEmail, [isVerified.decoded.email], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'This is not a valid email'));
      }
      // let email = [];
      // let sms = [];
      // let both = [];
      // result.map((user, inx) => {
      //   if (user.method === 'email') {
      //     let count = 0;
      //     email = [{ email: count++ }];
      //   } else if (user.method === 'sms') {
      //     let count = 0;
      //     sms.push( [{ sms: count++ }])
      //     console.log(count);
      //   } else if (user.method === 'both') {
      //     let count = 0;
      //     both = [{ both: count++ }];
      //   }
      // });
      return res.json(
        authErrorMessage('success', 'ok', {
          data: result,
        })
      );
      // const methods =
      //   'SELECT COUNT(*) AS methods FROM client_visitor  WHERE user_email = ?';

      // con.query(methods, [isVerified.decoded.email], async (err, result) => {
      //   data = [...result];
      // });

      // const methods =
      //   'SELECT COUNT(*) AS methods FROM client_visitor  WHERE user_email = ?';

      // con.query(methods, [isVerified.decoded.email], async (err, result) => {
      //   data = [...result];
      // });

      // const sql = 'SELECT id, email, date, isValid FROM users WHERE email = ?';
      // con.query(sql, [result[0].email], async (err, result) => {
      //   if (err) {
      //     return res.json({ error: 'Problem get all users' });
      //   }
      //   return res.json({
      //     email: result[0].email,
      //     username: result[0].username,
      //     id: result[0].id,
      //     isValid: result[0].isValid,
      //     valid: true,
      //   });
      // });
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'This problem'));
  }
};

const miniUpdateGet = (req, res) => {
  const token = req.headers.token;
  try {
    const isVerified = verifyToken(token);

    const hasEmail =
      'SELECT username, phone, company_name, facebook_link,google_link,  sms_message, email_message , temporaray_lock FROM users WHERE email = (?)';
    con.query(hasEmail, [isVerified.decoded.email], async (err, result) => {
      console.log(result);
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'no data'));
      }
      return res.json(authErrorMessage('success', 'no data', { data: result }));
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'no data'));
  }
};
const miniUpdatePut = (req, res) => {
  const token = req.headers.token;
  const {
    username,
    phone,
    companyName,
    google,
    facebook,
    editEmail,
    editSms,
    temporary,
  } = req.body;
  try {
    const isVarify = verifyToken(token);
    const updateUser =
      'UPDATE users SET username = ?, phone = ?, company_name = ?, google_link = ?, facebook_link = ?, sms_message = ?, email_message = ? , temporaray_lock = ? WHERE email = ?';

    con.query(
      updateUser,
      [
        username,
        phone,
        companyName,
        google,
        facebook,
        editSms,
        editEmail,
        temporary,
        isVarify.decoded.email,
      ],
      async (err, result) => {
        return res.json(authErrorMessage('success', 'Update successful'));
      }
    );
  } catch (error) {
    return res.json(authErrorMessage('error', 'Data not updated'));
  }
};
module.exports = {
  create,
  login,
  update,
  getUsers,
  getSingleUser,
  forgetPassword,
  resetPassword,
  postRestPassword,
  getDashboadData,
  miniUpdateGet,
  miniUpdatePut,
};
