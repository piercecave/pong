"use strict";

const rabbitmqhelpers = require("./rabbitmqhelpers");

/**
 * updateMsg updates the message body property using the JSON in the request body, and respond with a 
 * copy of the newly-updated message, encoded as a JSON object. Include a Content-Type header set to 
 * application/json so that your client knows what sort of data is in the response body.
 * @param {Request} req HTTP request object 
 * @param {Response} res HTTP response object
 */
async function updateMsg(req, res) {
  const messageid = req.params.messageid;
  let newBody = req.body.body;
  const db = req.db;

  let editedAt;
  try {
    const qry = "UPDATE Messages SET Body = ?, LastUpdated = NOW() WHERE ID = ?;";
    await db.query(qry, [newBody, messageid]);
  } catch (err) {
    console.log(err.message);
    res.set("Content-Type", "text/plain");
    res.status(500).send("Server Error: Cannot update message in database.");
    db.end();
    return;
  }

  const qryTwo = "SELECT * FROM Messages WHERE ID = ?;";
  const message = await db.query(qryTwo, [messageid]);
  editedAt = message[0].LastUpdated;

  const updatedMsg = {
    "id": parseInt(messageid, 10),
    "channelID": message[0].ChannelID,
    "body": newBody,
    "createdAt": message[0].TimeCreated,
    "creator": req.user,
    "editedAt": editedAt
  }

  const memberIDs = await rabbitmqhelpers.getMemberIDs(message.channelID, db);

  const updateMessageObject = {
    "type": "message-update",
    "message": updatedMsg,
    "userIDs": memberIDs.members
  }

  //req.amqpChannel.sendToQueue("events", JSON.stringify(updateMessageObject), { persistent: true });
  console.log(" [x] Sent %s", JSON.stringify(updateMessageObject));

  res.status(200).json(updatedMsg)
}

/**
 * deleteMsg if the current user isn't the creator of this message, respond with the status
 * code 403 (Forbidden). Otherwise, delete the message and respond with a the plain text message 
 * indicating that the delete was successful.
 * @param {Request} req HTTP request object 
 * @param {Response} res HTTP response object
 */
async function deleteMsg(req, res) {
  const messageid = req.params.messageid;
  const db = req.db;
  try {
    const qryTwo = "SELECT * FROM Messages WHERE ID = ?;";
    //const message = await db.query(qryTwo, [messageid]);
    // if (message.creator != req.user.id) {
    //   res.set("Content-Type", "text/plain");
    //   res.status(404).send("User Error: not correct user.");
    // }
    const qry = "DELETE FROM Messages WHERE ID = ?";
    await db.query(qry, [messageid]);
  } catch (err) {
    console.log(err.message);
    res.set("Content-Type", "text/plain");
    res.status(500).send("Server Error: Cannot delete message from database.");
    db.end();
    return;
  }
  //db.end();

  //const memberIDs = await rabbitmqhelpers.getMemberIDs(message.channelID, db);

  // const deleteMessageObject = {
  //   "type": "message-delete",
  //   "channelID": message.channelID,
  //   "userIDs": memberIDs.members
  // }

  //req.amqpChannel.sendToQueue("events", JSON.stringify(deleteMessageObject), { persistent: true });
  //console.log(" [x] Sent %s", JSON.stringify(deleteMessageObject));

  res.status(200).type("text").send("The message was deleted successfully.")
}

// ----- Helper Functions -----

// getUserProfile returns user information given the 
// user ID so the 'creator' field can be populated with 
// an entire profile
async function getUserProfile(userID, db) {
  try {
    const qry = "SELECT ID, UserName, FirstName, LastName, PhotoURL FROM Users WHERE ID = ?;";
    const user = await db.query(qry, [userID]);
    const userProfile = {
      "id": user[0].ID,
      "userName": user[0].UserName,
      "firstName": user[0].FirstName,
      "lastName": user[0].LastName,
      "photoURL": user[0].PhotoURL
    }
    return { profile: userProfile, error: null };
  } catch (err) {
    return { profile: null, error: err };
  }
}


/**
 * Expose public handler functions.
 */
module.exports = {
  updateMsg,
  deleteMsg
}