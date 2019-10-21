export const CELL_SIZE = 40
export const GAME_WIDTH = 480
export const GAME_HEIGHT = 480

export const EMPTY_CELL = 0              // 0: empty cell
export const WALL = 1                    // 1: wall
export const PLAYER_ON_EMPTY_CELL = 2    // 2: empty cell with player on it
export const PORTAL = 3                  // 3: portal
export const NON_CELL = 4                // 4: no-func cell for now
export const PLAYER_ON_PORTAL = 5        // 5: portal with player on it
export const ENEMY_ANT = 6               // 6: ant
export const ENEMY_ANT_ON_PORTAL = 7     // 7: portal with ant on it
export const LAKE = 8
export const BOAT_ON_LAKE = 9
export const PLAYER_ON_BOAT = 10

export const MOVABLE_CELLS = {
  2 : [EMPTY_CELL, PORTAL, BOAT_ON_LAKE],
  10: [LAKE, EMPTY_CELL],
  5 : [EMPTY_CELL]
}

export const PLAYER_CONTAINER_CELLS = [
  PLAYER_ON_EMPTY_CELL, PLAYER_ON_PORTAL, PLAYER_ON_BOAT
]

export const ENEMY_CELLS = [
  ENEMY_ANT
]

export const ENEMT_MOVABLE_CELLS = [
  EMPTY_CELL, PLAYER_ON_EMPTY_CELL
]

export const MOVE_CELL_TRANSITIONS = {
  2 : { 0: 2, 9: 10, 3: 5 },   
  0 : { 2: 0, 10: 9, 5: 3 },
  3 : { 5: 3, 2: 0 },
  5 : { 0: 2 },
  9 : { 9: 10, 2: 0 },
  10: { 10: 8, 8 : 10, 0: 2 },
  8 : { 10: 8 }
}

// export const PLAYER_MOVE_CELL_TRANSITIONS = {
//    2 : 0,  // empty cell with player -> empty cell
//    0 : 2,  // empty cell -> empty cell with player on it
//    3 : 5,  // portal -> portal with player on it
//    5 : 3,  // portal with player -> portal
//    9 : 10, // boat -> player on boat
//   10 : 8,  // player on boat -> boat, 
//    8 : 10  // lake -> player on boat
// }
