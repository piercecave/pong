CREATE DATABASE IF NOT EXISTS infodb;
USE infodb;

CREATE TABLE IF NOT EXISTS Users (
    ID INT NOT NULL AUTO_INCREMENT,
    Email VARCHAR(255) NOT NULL UNIQUE,
    PassHash VARCHAR(72) NOT NULL,
    UserName VARCHAR(255) NOT NULL UNIQUE,
    FirstName VARCHAR(128),
    LastName VARCHAR(128),
    PhotoURL VARCHAR(2083) NOT NULL,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS UserSignInLog (
    UserID INT NOT NULL,
    SignInTime DATETIME NOT NULL,
    ClientIP VARCHAR(60) NOT NULL,
    FOREIGN KEY (UserID) REFERENCES Users(ID)
);

CREATE TABLE IF NOT EXISTS Channels (
    ID INT NOT NULL AUTO_INCREMENT,
    ChannelName VARCHAR(255) NOT NULL UNIQUE,
    ChannelDescription VARCHAR(255),
    PrivateChannel BOOLEAN NOT NULL,
    TimeCreated DATETIME NOT NULL,
    Creator INT,
    LastUpdated DATETIME,
    PRIMARY KEY (ID)
);

CREATE TABLE IF NOT EXISTS ChannelsJoinMembers (
    CJMID INT NOT NULL AUTO_INCREMENT,
    ChannelID INT NOT NULL,
    MemberID INT NOT NULL,
    PRIMARY KEY (CJMID)
);

CREATE TABLE IF NOT EXISTS Messages (
    ID INT NOT NULL AUTO_INCREMENT,
    ChannelID INT NOT NULL,
    Body VARCHAR(255) NOT NULL,
    TimeCreated DATETIME NOT NULL,
    Creator INT NOT NULL,
    LastUpdated DATETIME,
    PRIMARY KEY (ID)
);

-- Always include a public 'General' channel
INSERT INTO Channels(ChannelName, ChannelDescription, PrivateChannel, TimeCreated) 
VALUES('General', 'The public general channel.', 0, now());

-- Reference https://stackoverflow.com/questions/50093144/mysql-8-0-client-does-not-support-authentication-protocol-requested-by-server
ALTER USER root IDENTIFIED WITH mysql_native_password BY 'testpwd';

