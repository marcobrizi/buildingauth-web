'use strict'

var buildingauth = require('@bibocreation/buildingauth');
var Joi = require('joi');



module.exports.register = function (server, options, next) {

  var db = server.plugins['hapi-mongodb'].db;
  var auth = buildingauth({'db':db});

  function getUser (request, reply) {
    auth.getUserInfo(request.params.username, function(err, user) {
      if (err) {
        throw err;
      }
      if (user == null) {
        reply().code(404);
      } else {
        reply(user);
      }
    });
  }

  function addUser (request, reply) {
    auth.addUser(request.payload.username, request.payload.password, request.payload.email, function(err) {
      if (err) {
        throw err;
      }
      reply().code(201);
    });
  }

  function authenticate (request, reply) {
    auth.authenticate(request.payload.username, request.payload.password, function(err, result) {
      if (err) {
        throw err;
      }
      if (result) {
        reply().code(200);
      } else {
        reply().code(401);
      }
    });
  }

//  server.route({ method: 'GET', path: '/', handler: hello })

  server.route({ method: 'GET', path: '/users/{username}', config:  {
    handler: getUser,
    validate : {
      params: {
        username: Joi.string()
      }
    }
  }});
  server.route({ method: 'POST', path: '/users', config: {
    handler : addUser,
    validate : {
      payload: {
        username: Joi.string(),
        password: Joi.string(),
        email: Joi.string()
      }
    }
  }});
  server.route({ method: 'POST', path: '/auth', config: {
    handler : authenticate,
    validate : {
      payload: {
        username: Joi.string(),
        password: Joi.string()
      }
    }
  }});

  next()
}

module.exports.register.attributes = {
  name: 'myplugin',
  version: '0.0.1'
}
