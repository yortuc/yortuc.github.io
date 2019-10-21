import { PORTAL } from './constants.js'
import { maps } from './maps.js'
import { renderGame } from './mapRenderer.js'
import { tryMovePlayer, moveEnemies } from './player.js'

const c =  document.getElementById("c").getContext("2d")

let mapIndex = 0
let currentMap = maps[0]

let startTime = null
let elapsedTime = 0
let pathWays = [[]]

document.addEventListener('keydown', function checkKey(e) {
  let move = null
  if(event.keyCode === 37) move = {x: -1} // left
  if(event.keyCode === 39) move = {x: 1}  // right
  if(event.keyCode === 40) move = {y: 1}  // down
  if(event.keyCode === 38) move = {y: -1} // up
  
  if(!move) return

  tryMovePlayer(currentMap, move, (currentCellId, targetCellId) => {
      
      pathWays = moveEnemies(currentMap)
    
      if(targetCellId === PORTAL){ // moved on portal -> change the currentMap
        setTimeout(function(){ 
          mapIndex += 1
          currentMap = maps[mapIndex]
        }, 500);
      }
  })
})

function step(timestamp) {
  elapsedTime = timestamp
  
  if (!startTime) startTime = timestamp;
  var dt = timestamp - startTime;

  renderGame(c, currentMap, dt, elapsedTime, pathWays)
  
  startTime = timestamp
  window.requestAnimationFrame(step)
}

window.requestAnimationFrame(step)
