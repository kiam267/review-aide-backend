const { authErrorMessage } = require('../utils/error');
const { verifyToken } = require('../utils/utils');
const con = require('../utils/bd');
const { Queue } = require('bullmq');
const { queueINIT } = require('../utils/redisbd');


const queue = queueINIT('customer-support');
const sendEmail = async (req, res) => {
  const token = req.headers.token;
  const { email, msg } = req.body;

  try {
    const user = await verifyToken(token);
    const sql = 'SELECT * FROM users WHERE email = ?';
    con.query(sql, [user.decoded.email], async (err, result) => {
      if (err) {
        return res.json(authErrorMessage('error', 'Email not found'));
      }
      await queue.add(`customer-support-11`, {
        email,
        msg,
      });
      const user = 'INSERT INTO customer_support (email, text) VALUES (?, ?)';

      con.query(user, [msg, result[0].email], async (err, result) => {
        return res.json(
          authErrorMessage('success', 'Your request was successfully')
        );
      });
    });
  } catch (error) {
    console.log(error);
    res.json(authErrorMessage('error', 'verify token failed'));
  }
};

module.exports = { sendEmail };
