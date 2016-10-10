'use strict';

const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const Promise = require('bluebird');
const mongoose = require('mongoose');
const debug = require('debug')('ht:server');

// const authRouter = require('./route/auth-router.js');
const errorMiddleware = require('./lib/error-middleware.js');

dotenv.load();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

const PORT = process.env.PORT;
const app = express();

app.use(morgan('dev'));

// app.use(authRouter);
app.use(errorMiddleware);

const server = module.exports = app.listen(PORT, () => {
  debug(`server up on ${PORT}`);
});

server.isRunning = true;
