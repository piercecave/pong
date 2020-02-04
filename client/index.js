
"use strict";

/*

REQUIRED
 - pausing
 - reset ball button
 - Make bars for detecting scores
 - React to a score

 - restrict paddle movement
 - randomize movement of ball
 - Make enemy a.i.

OPTIONAL
 - Maintain aspect ratio
 - less choppy collision detections

*/

import { Wall, Ball, PauseButton } from "./js/elements.js"
import { UserPaddle, RivalPaddle } from "./js/paddles.js"
import { onMouseDown, onMouseMove, onMouseUp, onTouchMove } from './js/events.js'
import { detectCollisions } from './js/collisions.js'

window.addEventListener("load", () => {
  initPongGame();
});

const initPongGame = () => {

  var oldTimeStamp = 0;
  var gameElements = [];

  var gameCanvas = document.getElementById("game_canvas");
  const nav = document.getElementById("navbar");

  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight - nav.offsetHeight;
  var context = gameCanvas.getContext('2d');

  var userPaddle = new UserPaddle(gameCanvas.width / 2 - 50, gameCanvas.height - 20, 0, 0, "#ffffff", 100, 10);
  var rivalPaddle = new RivalPaddle(gameCanvas.width / 2 - 50, 10, 0, 0, "#ffffff", 100, 10);
  var gameBall = new Ball(gameCanvas.width / 2 - 12.5, gameCanvas.height * .25 - 12.5, 150, 150, "blue", 25, 25);

  gameElements.push(new Wall(5, 5, 0, 0, "#ffffff", 10, gameCanvas.height - 10));
  gameElements.push(new Wall(gameCanvas.width - 15, 5, 0, 0, "#ffffff", 10, gameCanvas.height - 10));
  gameElements.push(rivalPaddle);
  gameElements.push(userPaddle);
  gameElements.push(gameBall);

  var rivalGoal = new Wall(0, 0, 0, 0, "black", gameCanvas.width, 7);
  var userGoal = new Wall(0, gameCanvas.height - 7, 0, 0, "black", gameCanvas.width, 7);

  gameElements.push(rivalGoal);
  gameElements.push(userGoal);

  var pauseButton = new PauseButton(gameCanvas.width - 70, 30, "#d3d3d3");
  gameElements.push(pauseButton);

  gameCanvas.onmousedown = function (e) {
    onMouseDown(e, gameCanvas, userPaddle, pauseButton);
  };
  gameCanvas.onmousemove = function (e) {
    onMouseMove(e, gameCanvas, userPaddle);
  };;
  gameCanvas.onmouseup = function (e) {
    onMouseUp(e, gameCanvas, userPaddle);
  };;
  gameCanvas.ontouchmove = function (e) {
    onTouchMove(e, gameCanvas, userPaddle);
  };;

  window.requestAnimationFrame( function(timeStamp) {
    gameLoop(timeStamp, oldTimeStamp, context, gameCanvas, userPaddle, rivalPaddle, gameBall, gameElements, pauseButton);
  });
}

const gameLoop = (timeStamp, oldTimeStamp, context, gameCanvas, userPaddle, rivalPaddle, gameBall, gameElements, pauseButton) => {
  var secondsPassed = (timeStamp - oldTimeStamp) / 1000;
  oldTimeStamp = timeStamp;

  if(pauseButton.isClicked) {
    console.log("you clicked pause");
  }

  updateObjects(gameElements, secondsPassed, gameBall);
  detectCollisions(gameElements);
  clearCanvas(context, gameCanvas);

  drawCenterFieldLine(context, gameCanvas);
  drawElements(context, gameElements);

  // Keep requesting new frames
  window.requestAnimationFrame( function(newTimeStamp) {
    gameLoop(newTimeStamp, oldTimeStamp, context, gameCanvas, userPaddle, rivalPaddle, gameBall, gameElements, pauseButton);
  });
}

const drawCenterFieldLine = (context, gameCanvas) => {
  context.fillStyle = "#ffffff";
  context.fillRect(5, gameCanvas.height / 2 - 2, gameCanvas.width - 10, 4);
}

const updateObjects = (gameElements, secondsPassed, gameBall) => {
  var object;
  for (object of gameElements) {
    object.update(secondsPassed);
    if (object.type() == "ENEMY_PADDLE") {
      object.setLateralPosition(gameBall.x);
    }
  }
}

const clearCanvas = (context, gameCanvas) => {
  context.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
}

const drawElements = (context, gameElements) => {
  var object;
  for (object of gameElements) {
    object.draw(context);
  }
}