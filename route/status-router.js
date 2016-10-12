'use strict';

const Router = require('express').Router;
const debug = require('debug')('ht:status-router');
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const bearerAuth = require('../lib/bearer-auth-middleware');
const Status = require('../model/status');
const Hospital = require('../model/hospital');

const statusRouter = module.exports = Router();

statusRouter.post('/api/hospital/:hospitalID/status', bearerAuth, jsonParser, function(req, res, next) {
  debug('Hit POST /api/hospital/:hospitalID/status');

  if(req.body.hospitalID !== req.params.hospitalID) return next(createError(404, 'Hospital not found.'));
  Hospital.findById(req.params.hospitalID)
  .catch(err => Promise.reject(createError(404, err.message)))
  .then(() => {
    new Status(req.body).save()
    .then(status => res.json(status));
  })
  .catch(next);
});

statusRouter.get('/api/hospital/:hospitalID/status/:statusID', bearerAuth, function(req, res, next) {
  debug('Hit GET /api/hospital/:hospitalID/status/:statusID');

  Status.findById(req.params.statusID)
  .catch(err => Promise.reject(createError(400, err.message)))
  .then(status => {
    if(status.userID.toString() !== req.user._id.toString()) return Promise.reject(createError(401, 'invalid userid'));
    if(status.hospitalID.toString() !== req.params.hospitalID.toString()) return Promise.reject(createError(404, 'Hospital mismatch'));
    res.json(status);
  })
  .catch(next);
});

statusRouter.delete('/api/hospital/:hospitalID/status/:statusID', bearerAuth, function(req, res, next) {
  debug('Hit DELETE /api/hospital/:hospitalID/status/:statusID');

  Status.findById(req.params.statusID)
  .then(status => {
    if(status.userID.toString() === req.user._id.toString()) {
      if(status.hospitalID.toString() !== req.params.hospitalID) return Promise.reject(createError(404, 'Hospital mismatch'));
      Status.findByIdAndRemove(req.params.statusID)
      .then(() => res.sendStatus(204))
      .catch(next);
    } else {
      return Promise.reject(createError(401, 'Invalid user ID'));
    }
  })
.catch(err => err.status ? next(err) : next(createError(404, err.message)));
});

statusRouter.put('/api/hospital/:hospitalID/status/:statusID', bearerAuth, function(req, res, next) {
  debug('Hit PUT /api/hospital/:hospitalID/status/:statusID');

  Status.findById(req.params.statusID)
  .then(status => {
    if(status.userID.toString() === req.user._id.toString()) {
      if(status.hospitalID.toString() !== req.params.hospitalID) return Promise.reject(createError(404, 'Hospital mismatch'));
      Status.findByIdAndUpdate(req.params.profileID, req.body, {new:true})
      .then(status => res.json(status))
      .catch(next);
    } else {
      return Promise.reject(createError(401, 'Invalid user ID'));
    }
  })
.catch(err => err.status ? next(err) : next(createError(404, err.message)));
});