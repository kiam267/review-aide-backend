const con = require('../utils/bd');
const uniqid = require('uniqid');
const { authErrorMessage } = require('../utils/error');
const { verifyToken } = require('../utils/utils');
const { queueINIT } = require('../utils/redisbd');

const queue = queueINIT('email-queue');

const visitor = async (req, res) => {
  const { username, email, phone, date, LINK, token, method, selectedItems } =
    req.body;
  const uniqId = uniqid();
  const linkPort = LINK + `review/${uniqId}`;

  try {
    const isVarify = verifyToken(token);
    const userSql =
      'SELECT company_name, phato_path, sms_message, email_message  FROM users WHERE email = ?';
    con.query(userSql, [isVarify.decoded.email], async (err, userRes) => {
      if (err) {
        return res.json(authErrorMessage('error', 'user not valid'));
      }
      const transformedArray = selectedItems.map(item => [
        uniqId,
        item.method,
        item.username,
        item.email,
        item.phone,
        isVarify.decoded.email,
        1,
      ]);

      selectedItems.forEach(async item => {
        console.log(item);
        await queue.add(`message-queue`, {
          method: item.method,
          linkPort,
          email: item.email,
          username: item.username,
          phone: item.phone,
          phato_path: userRes[0].phato_path,
          company_name: userRes[0].company_name,
          sms_message: userRes[0].sms_message,
          email_message: userRes[0].email_message,
          unsubscribe: `${LINK}user/unsubscribe/${uniqId}`,
        });
      });

      const sql =
        'INSERT INTO client_visitor (client_id, method, name, email, number,user_email, count) VALUES ? ';
      const countV = 1;
      con.query(sql, [transformedArray], (err, userData) => {
        if (err) {
          return res.json(
            authErrorMessage('error', 'Data not save! please try again')
          );
        }
        return res.json(
          authErrorMessage('success', 'Message sent successfully')
        );
      });
    });
    const hasEmail = 'SELECT * FROM client_visitor WHERE email = ?';
    // con.query(hasEmail, [email], async (err, result) => {
    //   if (err) {
    //     return res.json(authErrorMessage('error', 'Some Internal Problem'));
    //   }
    //   const clientSQL =
    //     'SELECT COUNT(*) as count FROM client_visitor WHERE unsubscribe = 0 AND email = ?';
    //   con.query(clientSQL, [email], async (err, clientRes) => {
    //     console.log(clientRes);
    //     if (clientRes[0].count === 1) {
    //       return res.json(
    //         authErrorMessage(
    //           'error',
    //           'The client has already unsubscribed your service'
    //         )
    //       );
    //     }
    //   });

    // });
  } catch (error) {
    return res.json(authErrorMessage('error', 'Internate Problem!'));
  }
};

const getAllSendData = async (req, res) => {
  const token = req.headers.token;
  try {
    const isVerifyToken = verifyToken(token);
    const sql =
      'SELECT method, name, email , number, date , review_method FROM client_visitor WHERE user_email = ?';

    con.query(sql, [isVerifyToken.decoded.email], (err, result) => {
      if (err) {
        return res.json(authErrorMessage('error', 'ok'));
      }
      return res.json(authErrorMessage('success', 'ok', { data: result }));
    });
  } catch (error) {
    return res.json(authErrorMessage('error', 'ok'));
  }
};

const getVisitor = (req, res) => {
  const { clientid } = req.headers;
  try {
    const hasClientId = 'SELECT * FROM client_visitor WHERE client_id = ?';
    con.query(hasClientId, [clientid], async (err, result) => {
      if (result.length === 0) {
        return res.json(
          authErrorMessage('error', 'ok', {
            isSend: false,
          })
        );
      }
      const user = 'SELECT * FROM users WHERE email = ?';
      con.query(user, [result[0].user_email], async (err, result_1) => {
        return res.json(
          authErrorMessage('success', 'ok', {
            isSend: Boolean(result[0].isSend),
            facebook_link: result_1[0].facebook_link,
            google_link: result_1[0].google_link,
            logo: result_1[0].phato_path,
          })
        );
      });
    });
  } catch (error) {
    return res.json(
      authErrorMessage('error', 'ok', {
        isSend: false,
      })
    );
  }
};

const methodsClickVisitor = (req, res) => {
  const { clientId, item, dateData } = req.body;
  try {
    const hasClientId = 'SELECT * FROM client_visitor  WHERE client_id = ?';
    console.log(clientId);
    con.query(hasClientId, [clientId], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'ok'));
      }
      const user =
        'UPDATE client_visitor SET review_method = ?, date = ?, isSend = ?  WHERE email = ?';
      con.query(
        user,
        [item, dateData, true, result[0].email],
        async (errd, result) => {
          console.log('ok');
        }
      );
    });
  } catch (error) {}
};
const unsubscribe = (req, res) => {
  try {
    const { id, isUnsubscribe } = req.body;
    console.log(id, isUnsubscribe);
    const sql =
      'UPDATE client_visitor SET unsubscribe = ? WHERE client_id = ? ';
    con.query(sql, [isUnsubscribe, id], async (err, result) => {
      return res.json(authErrorMessage('success', 'success'));
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'server error'));
  }
};

// QR code add and get
const qr_code_get = (req, res) => {
  try {
    const { token, link } = req.headers;
    const isVerify = verifyToken(token);
    const sql = 'SELECT * FROM qr_code  WHERE user_email = ? AND valid = ?';
    con.query(sql, [isVerify.decoded.email, 1], (err, userData) => {
      if (userData.length == 0) {
        return res.json(
          authErrorMessage('success', {
            id: 'none',
            valid: false,
          })
        );
      }
      res.json(
        authErrorMessage('success', {
          id: link + 'user/open-review/' + userData[0].unique_id,
          valid: Boolean(Number(userData[0].valid)),
        })
      );
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'Internal Server Error'));
  }
};
const qr_code_gen = (req, res) => {
  try {
    const { token, LINK } = req.body;
    const isVerify = verifyToken(token);
    const uniqId = uniqid();

    const sql = 'INSERT INTO qr_code (unique_id, user_email) VALUES (?,?) ';
    con.query(sql, [uniqId, isVerify.decoded.email], (err, clientData) => {
      res.json(
        authErrorMessage('success', {
          id: LINK + 'user/open-review/' + uniqId,
          valid: true,
        })
      );
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'Internal Server Error'));
  }
};
const qr_code_delete = (req, res) => {
  const { token } = req.headers;
  const link = req.body.LINK;
  const isVerify = verifyToken(token);
  try {
    const deleteSql = 'UPDATE qr_code SET valid = ? WHERE user_email = ?';
    con.query(deleteSql, [false, isVerify.decoded.email], (err, clientData) => {
      if (err) {
        return res.json(authErrorMessage('error', 'Internal Server Error'));
      }
      res.json(
        authErrorMessage('success', {
          id: 'dfdfgd',
          valid: false,
        })
      );
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'Internal Server Error'));
  }
};

module.exports = {
  visitor,
  getVisitor,
  getAllSendData,
  methodsClickVisitor,
  unsubscribe,
  qr_code_get,
  qr_code_gen,
  qr_code_delete,
};
