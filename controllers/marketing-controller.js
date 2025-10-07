const con = require('../utils/bd');
const uniqid = require('uniqid');
const { authErrorMessage } = require('../utils/error');
const { verifyToken } = require('../utils/utils');
const { queueINIT } = require('../utils/redisbd');
const queue = queueINIT('marketing-queue');

const marketingUserStore = async (req, res) => {
  const { username, email, phone, token, method, message, LINK } = req.body;
  const uniqId = uniqid();

  try {
    const isVerify = verifyToken(token);
    const hasEmail = 'SELECT * FROM users WHERE email = ?';
    con.query(hasEmail, [isVerify.decoded.email], async (err, userRes) => {
      await queue.add(`marketing-queue`, {
        method,
        email,
        username,
        phone,
        phato_path: LINK + 'api/uploads/' + userRes[0].phato_path,
        company_name: userRes[0].company_name,
        message,
        unsubscribe: `${LINK}user/unsubscribe/${uniqId}`,
      });
      const userMarketingInsertData =
        'INSERT INTO user_marketing (unique_id,  name, email, phone ,methods, user_email, content) VALUES (?,?,?,?,?,?,?)';

      con.query(
        userMarketingInsertData,
        [
          uniqId,
          username,
          email,
          phone,
          method,
          isVerify.decoded.email,
          message,
        ],
        async (err, ueserRes) => {
          return res.json(
            authErrorMessage('success', 'Message sent successfully')
          );
        }
      );
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'Internet error'));
  }
};

module.exports = { marketingUserStore };
