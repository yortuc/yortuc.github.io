import { 
  CELL_SIZE, 
  EMPTY_CELL, 
  WALL, 
  PLAYER_ON_EMPTY_CELL, 
  PORTAL, 
  PLAYER_ON_PORTAL, 
  ENEMY_ANT,
  LAKE, 
  BOAT_ON_LAKE,
  PLAYER_ON_BOAT
} from './constants.js'
import { clearScreen, drawSpiral } from './graphics.js'
import { getPlayerPosFromMap } from './player.js';

export const renderGame = (c, m, dt, elapsedTime, pathWays, score) => {
  c.save()
  // console.log(elapsedTime)
  clearScreen(c)
  c.translate(0.5, 0.5)
  
  for(let j=0; j<m.length; j++){
    for(let i=0; i<m.length; i++){
      renderCell(c, j, i, m[j][i], elapsedTime)
    }
  }

  // drawPathways(c, pathWays)
  // drawHud(c, score)

  const playerPos = getPlayerPosFromMap(m)
  drawPlayer(c, playerPos.y, playerPos.x, elapsedTime)

  c.restore()
}

const drawHud = (c, score) => {
    c.save()
    c.fillColor = "black"
    c.font = '20px serif'
    c.fillText("Health: 100 %", 400, 50)
    c.restore()
}

const createTileRect = (j,i) => [i * CELL_SIZE, j * CELL_SIZE, CELL_SIZE, CELL_SIZE]

const contractTileRect = (rct, pixels) => [
  rct[0] + pixels, rct[1] + pixels, CELL_SIZE - 2*pixels, CELL_SIZE - 2*pixels
]

const drawEmptyCell = (c, j, i) => {
  c.fillStyle = (j+i)%2 == 1 ? "white" : "#efefef"
  const rct = createTileRect(j, i)
  c.fillRect(...rct)
  c.strokeRect(...rct)
}

const drawWall = (c, j, i) => {
  c.fillStyle = "black"
  c.fillRect(...createTileRect(j, i))
}

let lastPlayerPos = {x: 0, y:0}
let isPlayerMoving = false
let playerMoveTime = null
let playerMovedPos = null
let playerMoveDirection = null

const drawPlayer = (c, j, i, elapsedTime) => {
  // initial player pos
  if(!lastPlayerPos){
    lastPlayerPos = {x: i, y: j}
  }
  
  let playerX = i*CELL_SIZE + CELL_SIZE/2
  let playerY = j*CELL_SIZE + CELL_SIZE/2
  let playerR = CELL_SIZE/2.5

  // player moved
  if(lastPlayerPos.x !== i || lastPlayerPos.y !== j){
    isPlayerMoving = true
    playerMovedPos = {x: lastPlayerPos.x, y: lastPlayerPos.y}
    playerMoveTime = elapsedTime
    playerMoveDirection = {x: i - lastPlayerPos.x, y: j - lastPlayerPos.y}
  }

  if(isPlayerMoving){
    const dt = elapsedTime - playerMoveTime
    const dx = dt * 0.8
    playerX = (playerMovedPos.x*CELL_SIZE + CELL_SIZE/2) + playerMoveDirection.x * dx
    playerY = (playerMovedPos.y*CELL_SIZE + CELL_SIZE/2) + playerMoveDirection.y * dx
    // playerR = (CELL_SIZE/2.5) - dx/3

    if (Math.abs(dx) >= CELL_SIZE) {
      isPlayerMoving = false
    }
  }

  c.fillStyle = "red"
  c.beginPath()
  c.arc(playerX, playerY, playerR, 0, 2 * Math.PI);
  c.closePath()
  c.fill()

  lastPlayerPos = {x: i, y: j}
}

const drawAnt = (c, j, i, elapsedTime) => {
  const index = Math.floor(elapsedTime / 100)
  //   console.log(index)
  const colors = ["orange"]

  c.fillStyle = 'black'
  c.beginPath();
  c.arc(i*CELL_SIZE + CELL_SIZE/2, j*CELL_SIZE + CELL_SIZE/2, CELL_SIZE/6, 0, 2 * Math.PI);
  c.closePath()
  c.fill();
  
  c.beginPath()
  c.moveTo(i*CELL_SIZE, j*CELL_SIZE + CELL_SIZE/2)
  c.lineTo(i*CELL_SIZE + CELL_SIZE, j*CELL_SIZE + CELL_SIZE/2)
  c.closePath()
  c.stroke()
  
  c.beginPath()
  c.moveTo(i*CELL_SIZE + CELL_SIZE/2, j*CELL_SIZE)
  c.lineTo(i*CELL_SIZE + CELL_SIZE/2, j*CELL_SIZE + CELL_SIZE)
  c.closePath()
  c.stroke()
}

const drawPortal = (c, j, i, elapsedTime) => {
  const index = Math.floor(elapsedTime / 100)
//   console.log(index)
  const colors = ["orange"]  
  c.strokeStyle = "orange"
  drawSpiral(c, j, i, 0, -index)
}

const drawLake = (c, j, i, elapsedTime) => {
  const rct = createTileRect(j, i)
  c.fillStyle = "#2196F3"
  c.fillRect(...rct)
}

const drawBoat = (c, j, i) => {
  const rct = contractTileRect(createTileRect(j, i), 3)
  c.fillStyle = "#795548"
  c.fillRect(...rct)
}

const renderCell = (c, j, i, id, elapsedTime) => {
  c.save()
  switch(id) {
    case EMPTY_CELL:
      drawEmptyCell(c, j, i)
      break
    case WALL:
      drawWall(c, j, i)
      break
    case PLAYER_ON_EMPTY_CELL:
      drawEmptyCell(c, j, i)
      drawPlayer(c, j, i, elapsedTime)
      break
    case PORTAL:
      drawEmptyCell(c, j, i)
      drawPortal(c, j, i, elapsedTime)
      break
    case PLAYER_ON_PORTAL:
      drawEmptyCell(c, j, i)     
      drawPlayer(c, j, i, elapsedTime)
      drawPortal(c, j, i, elapsedTime)
      break
    case ENEMY_ANT:
      drawEmptyCell(c, j,i)
      drawAnt(c, j, i, elapsedTime)
      break
    case LAKE:
      drawLake(c, j, i, elapsedTime)
      break
    case BOAT_ON_LAKE:
      drawLake(c, j, i, elapsedTime)
      drawBoat(c, j, i)
      break
    case PLAYER_ON_BOAT:
      drawLake(c, j, i, elapsedTime)
      drawBoat(c, j, i)
      drawPlayer(c, j, i, elapsedTime)
      break
  }
  c.restore()
}

const drawPathways = (c, paths) => {
  const colors = ["red", "blue", "green", "orange"]

  paths.forEach((path, index) => {
    c.strokeStyle = colors[index % colors.length]
    
    for(let i=1; i<path.length-1; i++){
      let [y1, x1] = path[i]
      let [y2, x2] = path[i+1]

      c.beginPath()
      c.moveTo(x1 * CELL_SIZE + CELL_SIZE/2, y1 * CELL_SIZE + CELL_SIZE/2)
      c.lineTo(x2 * CELL_SIZE + CELL_SIZE/2, y2 * CELL_SIZE + CELL_SIZE/2)
      c.closePath()
      c.stroke()
    }
  })
}