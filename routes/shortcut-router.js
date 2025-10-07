const express = require('express');
const router = express.Router();
const multer = require('multer');
const uniqId = require('uniqid');
const { isCheckUser } = require('../middlewares/checkUserValid-middleware');
const { verifyToken } = require('../utils/utils');
const con = require('../utils/bd');
const { authErrorMessage } = require('../utils/error');
const { queueINIT } = require('../utils/redisbd');
const queue = queueINIT('temporary-email-queue');

router.route('/getorpost').get((req, res) => {
  const { id } = req.headers;

  try {
    const hasEmail =
      'SELECT logo,google_link,facebook_link,yel_link,helth_link,valid FROM shortcutsql  WHERE unique_id = ?';
    con.query(hasEmail, [id], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'Client not created'));
      }
      console.log(result);
      if (Boolean(Number(result[0].valid))) {
        return res.json(
          authErrorMessage('success', 'ok', {
            data: result[0],
            valid: Boolean(Number(result[0].valid)),
          })
        );
      }
      return res.json(
        authErrorMessage('error', 'ok', {
          valid: Boolean(Number(result[0].valid)),
        })
      );
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'Internal Server Error'));
  }
});

router.route('/getorpost').post(async (req, res) => {
  const { textarea, id, rating, dateData, username, link } = req.body;
  function emailGenerator(start, name, textarea) {
    return {
      subject: 'subject  New Review Submitted via Your QR Code System',
      headre: `I hope this message finds you well. We are pleased
      to inform you that there has been
      recent activity on your <b>REVIEW QR code</b>
      . Today, someone has utilized it to submit a review through the provided private link. Below, you will find
      the
      details of the submitted review for your perusal and action as needed.<br /><br />`,
      miniMain: `Reviewer's Name :${name} <br /><br />
             Reviewed Star:${start}    <br /><br />
             Submitted Feedback: ${textarea}    <br /><br />
            `,
      mainContent: `We appreciate your attention to this feedback as it is invaluable in enhancing the services you offer. <br /><br />
  Thank you for your continued engagement with our review management system. Should you have any questions or require further assistance, please do not hesitate to get in touch.

  `,
      footer: `
 Warm regards,<br />
QR Code Admin<br />
WevTEC Website Fixing Services<br />
www.fixwebsiteissues.com<br />
Phone: 832 266 7209
  `,
    };
  }

  try {
    const hasClientId = 'SELECT * FROM shortcutsql WHERE unique_id = ?';
    con.query(hasClientId, [id], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }

      const sql = `INSERT INTO open_private_review (client_id, rating, textarea, user_email, date, username) VALUES (?, ?, ?,?,?,?);`;

      await queue.add(`temporary-email-queue`, {
        mainData: emailGenerator(rating, username, textarea),
        phato_path: link,
        email: result[0].user_emial_view,
      });

      con.query(
        sql,
        [
          uniqId(),
          rating,
          textarea,
          result[0].user_emial_view,
          dateData,
          username,
        ],
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
});

//publice review
router.route('/post').post((req, res) => {
  const { method, id, dateData, link } = req.body;

  try {
    const hasClientId = 'SELECT * FROM shortcutsql WHERE unique_id = ?';
    con.query(hasClientId, [id], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }
      const sql = `INSERT INTO public_review_shortcut (user_email, logo, company_name, date, method,user_emial_view) VALUES (?, ?, ?, ?, ?, ?);`;
      function emailGenerator() {
        return {
          subject: 'Successful Review Submission via Your QR Code System',
          headre: `I trust this message finds you in good spirits. We are delighted to inform you of a recent development regarding your REVIEW QR code. Today, it has been actively used by an individual to navigate towards the Google/Facebook review link, where they successfully submitted their feedback.<br /><br />`,
          miniMain: `This engagement signifies the effectiveness and utility of the QR code system in facilitating easy access for clients to share their experiences. We appreciate your commitment to enhancing customer satisfaction and value your participation in this innovative feedback process.<br/><br/>`,
          mainContent: `Should you have any inquiries or require further details, please feel free to reach out.<br/><br/>`,
          footer: `Warm regards,<br /> QR Code Admin<br /> WevTEC Website Fixing Services<br /> www.fixwebsiteissues.com<br /> Phone: 832 266 7209`,
        };
      }
      await queue.add(`temporary-email-queue`, {
        mainData: emailGenerator(),
        phato_path: link,
        email: result[0].user_emial_view,
      });

      con.query(
        sql,
        [
          result[0].user_email,
          result[0].logo,
          result[0].name,
          dateData,
          method,
          result[0].user_emial_view,
        ],
        async (err, result_data) => {
          console.log(err);
          return 'ok';
        }
      );
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'some error occurred'));
  }
});

// publice review methods
router.route('/post').get((req, res) => {
  const { id } = req.headers;
  try {
    const hasClientId =
      'SELECT logo, date,method,company_name FROM public_review_shortcut WHERE user_emial_view  = ?';
    con.query(hasClientId, [id], async (err, sqlData) => {
      if (sqlData.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }
      return res.json(authErrorMessage('success', 'ok', { data: sqlData }));
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'some error occurred'));
  }
});

router.use(isCheckUser);

// Multer configuration
let imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, './photos');
  },
  filename: (req, file, callback) => {
    const data = file.mimetype.replace('/', '.');
    callback(null, `image-${Date.now()}-${data}`);
  },
});

const isImage = (req, file, callback) => {
  console.log(file);
  if (file.mimetype.startsWith('image')) {
    callback(null, true);
  } else {
    callback(null, Error('only image is allowd'));
  }
};
let upload = multer({
  storage: imgconfig,
  fileFilter: isImage,
});

router.route('/').post(upload.single('imageURL'), function (req, res) {
  try {
    const token = req.headers.token;
    const { name, yelp_link, heathGrade_link, facebook_link, google_link } =
      req.body;
    const { filename } = req.file;
    console.log(req.body);
    const isVarify = verifyToken(token);
    const hasEmail = 'SELECT email FROM users WHERE email = (?)';
    con.query(hasEmail, [isVarify.decoded.email], async (err, result) => {
      const insertQuery = 'INSERT INTO shortcutsql SET ?';
      const newData = {
        name: name,
        logo: filename,
        google_link,
        facebook_link,
        yel_link: yelp_link,
        helth_link: heathGrade_link,
        user_email: result[0].email,
        unique_id: uniqId(),
        valid: true,
      };
      con.query(insertQuery, newData, async (err, result) => {
        if (result.length === 0) {
          return res.json(authErrorMessage('error', 'Clent not created'));
        }
        return res.json(
          authErrorMessage(
            'success',
            "The client link has been created successfully. If you can see this link, please go to the 'QR code' page."
          )
        );
      });
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'Internal Server Error'));
  }
});

router.route('/').get((req, res) => {
  const { token, link, avater_image_url } = req.headers;
  try {
    const isVerified = verifyToken(token);
    const hasEmail =
      'SELECT * FROM shortcutsql  WHERE user_email = (?)  AND valid = 1';
    con.query(hasEmail, [isVerified.decoded.email], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'Client not created'));
      }

      return res.json(authErrorMessage('success', 'ok', result));
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'Internal Server Error'));
  }
});

router.route('/:id').delete((req, res) => {
  const token = req.headers.token;
  const id = req.params.id;
  try {
    const isVarify = verifyToken(token);
    const hasEmail = 'UPDATE shortcutsql SET valid = ? WHERE unique_id = ?';
    con.query(hasEmail, [false, id], async (err, result) => {
      if (result.length === 0) {
        return res.json(authErrorMessage('error', 'Client not created'));
      }
      const hasEmail =
        'SELECT * FROM shortcutsql  WHERE user_email = (?)  AND valid = 1';
      con.query(hasEmail, [isVarify.decoded.email], async (err, result) => {
        if (result.length === 0) {
          return res.json(
            authErrorMessage('error', 'Client not created', { data: true })
          );
        }
        return res.json(
          authErrorMessage('success', 'Client succfully delete', result)
        );
      });
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'Internal Server Error'));
  }
});

router.route('/').put(upload.single('imageURL'), function (req, res) {
  try {
    const { custome_url, name, email, imageURL } = req.body;
    const filePath = req.file === undefined ? imageURL : req.file.filename;

    const token = req.headers.token;

    const isVarify = verifyToken(token);
    const sql =
      'UPDATE shortcutsql SET custom_url = ?, custom_phato_url = ?, user_emial_view = ? WHERE name = ? AND valid = 1';
    con.query(
      sql,
      [custome_url, filePath, email, name],
      async (err, result) => {
        console.log(err);
        const hasEmail =
          'SELECT * FROM shortcutsql  WHERE user_email = (?)  AND valid = 1';
        con.query(hasEmail, [isVarify.decoded.email], async (err, result) => {
          if (result.length === 0) {
            return res.json(
              authErrorMessage('error', 'Client not created', { data: true })
            );
          }
          return res.json(
            authErrorMessage('success', 'Client succfully delete', result)
          );
        });
      }
    );
  } catch (error) {
    return res.json(authErrorMessage('error', 'Please Add Image Or Text'));
  }
});

//edit
router.route('/post').get((req, res) => {
  const { token, id } = req.headers;
  try {
    const isVarify = verifyToken(token);
    const hasClientId =
      'SELECT logo, date,method,company_name FROM public_review_shortcut WHERE user_email = ?';
    con.query(hasClientId, [isVarify.decoded.email], async (err, sqlData) => {
      if (sqlData.length === 0) {
        return res.json(authErrorMessage('error', 'some error occurred'));
      }
      return res.json(authErrorMessage('success', 'ok', { data: sqlData }));
    });
  } catch (err) {
    return res.json(authErrorMessage('error', 'some error occurred'));
  }
});

module.exports = router;
