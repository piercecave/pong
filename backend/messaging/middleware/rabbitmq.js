"use strict";

/**
 * getRabbitMQConnection
 */
async function getRabbitMQConnection(req, res, next) {
    try {
        var amqp = require('amqplib/callback_api');
        var amqpConn = null;
        var amqpChannel = null;
        // Create connection with RabbitMQ
        amqpConn = amqp.connect('amqp://guest:guest@rabbitmqserver:5672', function(error0, connection) {
            if (error0) {
                console.log(error0);
                throw error0;
            }
            amqpChannel = connection.createChannel(function(error1, channel) {
                if (error1) {
                    console.log(error0);
                    throw error1;
                }
                var queue = 'events';
            
                channel.assertQueue(queue, {
                    durable: true
                });
                console.log("[AMQP] connected");
            });
        });
      // Store reference to rabbitmq connection and channel
      req.amqpConn = amqpConn;
      req.amqpChannel = amqpChannel;
      console.log("[AMQP] Connection: " + req.amqpConn);
      console.log("Created rabbit mq channel and queue");
      next();
    } catch(err) {
      console.error(err);
      res.set("Content-Type", "text/plain");
      res.status(404).send("RabbitMQ Error: Cannot connect to rabbitMQ server.");
      return
    }
}

/**
 * Expose public helper functions.
 */
module.exports = {
    getRabbitMQConnection
}