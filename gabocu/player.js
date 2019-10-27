import { 
  ENEMY_CELLS,
  MOVABLE_CELLS, 
  MOVE_CELL_TRANSITIONS,
  PLAYER_CONTAINER_CELLS 
} from './constants.js'

import { findPath } from './pathFinding.js'

export const tryMovePlayer = (map, move, playerMovedCallback) => {
    const {x, y, id} = getPlayerPosFromMap(map)
    
    if(move.x){
        const _x = x + move.x
        const targetCellId = map[y][_x]
        if(_x >= 0 && _x < map[0].length && 
           MOVABLE_CELLS[id].includes(targetCellId))
        {
          const currentCellId = map[y][x]
          map[y][_x] = MOVE_CELL_TRANSITIONS[currentCellId][targetCellId]
          map[y][x] = MOVE_CELL_TRANSITIONS[targetCellId][currentCellId]
          playerMovedCallback(currentCellId, targetCellId)
        }
    }
    
    if(move.y){
        const _y = y + move.y
        if(_y >= 0 && _y < map.length && 
           MOVABLE_CELLS[id].includes(map[_y][x]))
        {
          const currentCellId = map[y][x]
          const targetCellId = map[_y][x]
          map[_y][x] = MOVE_CELL_TRANSITIONS[currentCellId][targetCellId]
          map[y][x] = MOVE_CELL_TRANSITIONS[targetCellId][currentCellId]
          playerMovedCallback(currentCellId, targetCellId)
        }
    }
  }
  

export const getPlayerPosFromMap = (map) => {
    for(let j=0; j<map.length; j++){
      for(let i=0; i<map.length; i++){
        const cellId = map[j][i]
        if(PLAYER_CONTAINER_CELLS.includes(cellId)) {
          return {x: i, y:j, id: cellId}
        }
      }
    }
  }
  
export const enemyPositionsFromMap = (map) => {
  let enemies = []
  for(let j=0; j<map.length; j++){
    for(let i=0; i<map[0].length; i++){
      if(ENEMY_CELLS.includes(map[j][i])){
        enemies.push({y: j, x:i, id: map[j][i]})
      }
    }
  }
  return enemies
}

export const moveEnemies = (map) => {
  const enemies = enemyPositionsFromMap(map)
  const playerPos = getPlayerPosFromMap(map)

  let paths = []

  enemies.forEach((enemy)=> {
    const path = findPath(map, [enemy.y, enemy.x], [playerPos.y, playerPos.x])
    
    if(path.length>0){
      paths.push(path)

      // MOVE ENEMY HARDCODED
      const [enemyNextPosY, enemyNextPostX] = path[1]
      map[enemyNextPosY][enemyNextPostX] = 6
      map[enemy.y][enemy.x] = 0
    }
  })

  return paths
}