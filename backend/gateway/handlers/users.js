"use strict";

async function createNewUser(req, res) {

    














    const name = req.body.name;
    const createdAt = getDateTime();
    let creator = JSON.parse(req.get("X-User"));
    let isPrivate = false;
    if (req.body.private) {
        isPrivate = req.body.private
    }
    let description = undefined;
    if (req.body.description) {
        description = req.body.description
    }
    let members = undefined;
    if (req.body.members) {
        members = req.body.members;
    }
    let editedAt = undefined;
    if (req.body.editedAt) {
        editedAt = new Date(req.body.editedAt);
    }

    const db = req.db;
    var channelID;
    try {
        // Insert new channel into database
        const qry = "INSERT INTO Channels (ChannelName, ChannelDescription, PrivateChannel, TimeCreated, Creator, LastUpdated) VALUES (?,?,?,?,?,?);";
        const result = await db.query(qry, [name, description, isPrivate, createdAt, creator.id, editedAt]);
        channelID = result.insertId;
        // Insert channel members into database if applicable
        const qryTwo = "INSERT INTO ChannelsJoinMembers (ChannelID, MemberID) VALUES (?,?);";
        // Insert creator of channel into member table
        await db.query(qryTwo, [channelID, creator.id])
        if (typeof members !== 'undefined') {
            for (let i = 0; i < members.length; i++) {
                await db.query(qryTwo, [channelID, members[i].id]);
            }
        }
    } catch (err) {
        console.log(err.message);
        res.set("Content-Type", "text/plain");
        res.status(400).send("Server Error: Cannot insert into database.");
        db.end();
        return;
    }

    const newChannelWithID = {
        "id": channelID,
        "name": name,
        "description": description,
        "private": isPrivate,
        "members": members,
        "createdAt": createdAt,
        "creator": creator,
        "editedAt": editedAt
    }

    const memberIDs = await rabbitmqhelpers.getMemberIDs(channelID, db);

    const rabbitNewChannel = {
        "type": "channel-new",
        "channel": newChannelWithID,
        "userIDs": memberIDs.members
    }

    const error = sendMessageToRabbitMQ(rabbitNewChannel);
    if (error != null) {
        console.log("Error sending message to RabbitMQ: " + error);
        res.status(500).send("Error sending event message to RabbitMQ");
    }

    res.status(201).json(newChannelWithID);
}

/**
* Expose public handler functions.
*/
module.exports = {
    createNewUser
}