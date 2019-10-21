import { CELL_SIZE } from './constants.js'
import { renderGame } from './mapRenderer.js'
import { tryMovePlayer, moveEnemies } from './player.js'
  
const canvas = document.getElementById("c")
const p = document.getElementById("p")
const c = canvas.getContext("2d")

let currentMap = [
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
    [0, 0, 0, 0, 0, 0, 0, 0,],
]
let cachedMap = null

let startTime = null
let elapsedTime = 0
let pathWays = [[]]
let isPlaying = false

let currentCellType = 1
  
function step(timestamp) {
    elapsedTime = timestamp

    if (!startTime) startTime = timestamp;
    var dt = timestamp - startTime;

    renderGame(c, currentMap, dt, elapsedTime, pathWays)

    startTime = timestamp
    window.requestAnimationFrame(step)
}
  
document.addEventListener('keydown', function checkKey(e) {
    const code = e.keyCode

    if(code === 80) {
        resetTool()
        if(isPlaying) {  // key: p
            stopPlay()
        } else {
            startPlay()
        }
    }
    if(code === 77){ // m
        const mapSize = prompt("SIZE of")
        const newMap = []
        if(mapSize){
            for(let i=0; i<mapSize; i++){
                let row = []
                for(let j=0; j<mapSize; j++){
                    row.push(0)
                }
                newMap.push(row)
            }
            currentMap = newMap
        }
    }
    if(code === 53 || code < 48 || code > 57) return
    
    currentCellType = e.keyCode - 48
    resetTool()
    selectCurrentCellType()
})

const resetTool = () => {
    for (let item of document.getElementsByTagName("span")) {
        item.classList.remove("selected")
    }
}

const selectCurrentCellType = () => {
    document.getElementById("b" + currentCellType.toString()).classList.add("selected")
}

canvas.addEventListener('click', function(e) {
    const pos = getPosition(e)

    const x = Math.floor(pos.x / CELL_SIZE)
    const y = Math.floor(pos.y / CELL_SIZE)

    console.log("CELL:", y, x)

    updateMap(y, x, currentCellType)
    p.innerHTML = mapToHtml(currentMap)
})

const getPosition = (event) => {
    let x = event.x
    let y = event.y
    x -= canvas.offsetLeft
    y -= canvas.offsetTop
    return {x, y}
}

const updateMap = (y, x, val) => {
    currentMap[y][x] = val
}

const mapToHtml= (map) => {
    let ret = ""
    for(let j=0; j<map.length; j++){
        let row = ""
        for(let i=0; i<map.length; i++){
            row = row + map[j][i] + ","
        }
        ret = ret + "[" + row + "]," + "</br>"
    }
    return ret
}

const startPlay = () => {
    isPlaying = true
    cachedMap = currentMap.map(r => r.map(c => c))
    document.getElementById("play").classList.add("selected")
}

const stopPlay = () => {
    isPlaying = false
    currentMap = cachedMap
    cachedMap = null
    pathWays = [[]]
    document.getElementById("play").classList.remove("selected")
    selectCurrentCellType()
}

document.addEventListener('keydown', function checkKey(e) {
    if(!isPlaying) return

    let move = null
    if(event.keyCode === 37) move = {x: -1} // left
    if(event.keyCode === 39) move = {x: 1}  // right
    if(event.keyCode === 40) move = {y: 1}  // down
    if(event.keyCode === 38) move = {y: -1} // up

    if(!move) return

    tryMovePlayer(currentMap, move, (currentCellId, targetCellId) => {
        
        if(isPlaying){
            pathWays = moveEnemies(currentMap)
        }

        // if(targetCellId === PORTAL){ // moved on portal -> change the currentMap
        //     setTimeout(function(){ 
        //     mapIndex += 1
        //     currentMap = maps[mapIndex]
        //     }, 500);
        // }
    })
})

p.innerHTML = mapToHtml(currentMap)
window.requestAnimationFrame(step)