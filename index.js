import 'dotenv';
import swagger from './swagger/swagger.js';

import express from 'express';
import cors from 'cors';

import authRouter from './routes/auth-router.js';
import { errorMessage } from './utils/message.js';

// const userRouter = require('./routes/useres-router');
// import clientRouter from './routes/client-router.js';
// const reviewRouter = require('./routes/review-router');
// const customerSupportRouter = require('./routes/customer-router');
// const marketingRouter = require('./routes/marketing-route');
// const shortcutRouter = require('./routes/shortcut-router');

const app = express();

app.use(cors());
app.use(express.json());
app.use(function (err, req, res, next) {
  console.log(err);
  return errorMessage(res, 500, 'Internal Server Error');
});

// swagger setup
swagger(app);
const port = process.env.PORT || 5000;

// Serve static files from the 'uploads' directory
app.use('/api/uploads', express.static('uploads'));
app.use('/api/photos', express.static('photos'));

app.use('/api/v2/auth', authRouter);
// app.use('/api/users', userRouter);
// app.use('/api/client', clientRouter);
// app.use('/api/review', reviewRouter);
// app.use('/api/customer', customerSupportRouter);
// app.use('/api/marketing', marketingRouter);
// app.use('/api/shortcut', shortcutRouter);

// img storage confing
// Multer configuration
import multer from 'multer';

let imgconfig = multer.diskStorage({
  destination: (req, file, callback) => {
    console.log(file);
    callback(null, './uploads');
  },
  filename: (req, file, callback) => {
    callback(
      null,
      `image-${Date.now()}.${file.originalname}`
    );
  },
});

// img filter

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

app.listen(port, () => {
  console.log(`App listening on ${port}`);
});
