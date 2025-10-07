const { authErrorMessage } = require('../utils/error');
const uniqid = require('uniqid');
const con = require('../utils/bd');
const { token_verify, verifyToken } = require('../utils/utils');
const privateReview = (req, res) => {
  const { rating, textarea, clientId, dateData, private } = req.body;

  try {
    const hasClientId = 'SELECT * FROM client_visitor WHERE client_id = ?';
    con.query(hasClientId, [clientId], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }
      if (!Boolean(result[0].isSend)) {
        const sql = `INSERT INTO private_review (client_id,rating, textarea,username, email, user_email, number, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        con.query(
          sql,
          [
            result[0].client_id,
            rating,
            textarea,
            result[0].name,
            result[0].email,
            result[0].user_email,
            result[0].number,
            dateData,
          ],
          async (err, result_data) => {
            if (err) {
              console.log('private_review rivew not add some problem');
              return res.json(authErrorMessage('error', 'Problem'));
            }
            const updateIsSend =
              'UPDATE client_visitor SET review_method = ?, date = ?, isSend = ?  WHERE client_id = ?';
            con.query(
              updateIsSend,
              [private, dateData, true, clientId],
              async (err, result_data) => {
                return res.json(
                  authErrorMessage(
                    'success',
                    'Your review has been submitted successfully.'
                  )
                );
              }
            );
          }
        );
      } else {
        return res.json(
          authErrorMessage('error', 'You already  submit your review')
        );
      }
    });
  } catch (err) {
    console.log(err);
    return res.json(authErrorMessage('error', 'some error occurred'));
  }
};

const getUserPrivateReview = async (req, res) => {
  const token = req.headers.token;
  try {
    const user = verifyToken(token);

    const sql = ` SELECT rating, textarea, username, email, date, user_email FROM private_review  WHERE user_email = (?)`;
    con.query(sql, [user.decoded.email], async (err, privateRes) => {
      if (err) {
        return res.json(authErrorMessage('error', 'Internet connection error'));
      }
      const openUserReview =
        'SELECT * FROM open_private_review WHERE user_email = ?';
      con.query(
        openUserReview,
        [user.decoded.email],
        async (err, openUersRes) => {
          const data = [...privateRes, ...openUersRes];
          return res.json(authErrorMessage('success', 'ok', { data: data }));
        }
      );
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'verify token failed'));
  }
};
const qr_code_user_data_get = async (req, res) => {
  const emailId = req.headers.emialid;

  try {
    const openUserReview =
      'SELECT * FROM open_private_review WHERE user_email = ?';
    con.query(openUserReview, [emailId], async (err, openUersRes) => {
      const data = [...openUersRes];
      return res.json(authErrorMessage('success', 'ok', { data: data }));
    });
  } catch (error) {
    res.json(authErrorMessage('error', 'verify token failed'));
  }
};
// qr code gen
const review_qr_code = (req, res) => {
  const { id } = req.headers;

  try {
    const hasClientId = 'SELECT * FROM qr_code WHERE unique_id = ?';
    con.query(hasClientId, [id], async (err, result) => {
      console.log(err);
      if (result.length === 0) {
        return res.json(authErrorMessage('error', { valid: false }));
      }
      if (!Boolean(Number(result[0].valid))) {
        return res.json(
          authErrorMessage('error', { valid: Boolean(Number(result[0].valid)) })
        );
      }
      const user = 'SELECT * FROM users WHERE email = ?';
      con.query(user, [result[0].user_email], async (err, result_1) => {
        return res.json(
          authErrorMessage('success', 'ok', {
            facebook_link: result_1[0].facebook_link,
            google_link: result_1[0].google_link,
            logo: result_1[0].phato_path,
          })
        );
      });
    });
  } catch (error) {
    return res.json(authErrorMessage('error', { valid: false }));
  }
};

const qr_code_user_data_store = (req, res) => {
  const { textarea, id, rating, dateData } = req.body;
  const uniqId = uniqid();
  try {
    const hasClientId = 'SELECT * FROM qr_code WHERE unique_id = ?';
    con.query(hasClientId, [id], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }
      const sql = `INSERT INTO open_private_review (client_id, rating, textarea, user_email, date) VALUES (?, ?, ?, ?,?);`;
      con.query(
        sql,
        [uniqId, rating, textarea, result[0].user_email, dateData],
        async (err, result_data) => {
          return res.json(
            authErrorMessage(
              'success',
              'Your review has been submitted successfully.'
            )
          );
        }
      );
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'some error occurred'));
  }
};

module.exports = {
  privateReview,
  getUserPrivateReview,
  qr_code_user_data_store,
  review_qr_code,
  qr_code_user_data_get,
};
