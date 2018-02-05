const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

ctx.transform(1, 0, 0, -1, 0, canvas.height);
ctx.translate(100, 370);

function drawPoint(ctx, p, color='black'){
  if(!p) return;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(p[0], p[1], 3, 0, 2 * Math.PI, false);
  ctx.fill();
}

function drawLine(ctx, line){
 drawPoint(ctx, line.p1);
 drawPoint(ctx, line.p2);
  ctx.beginPath();
  ctx.moveTo(...line.p1);
  ctx.lineTo(...line.p2);
  ctx.stroke();
}

function isPointInRange(point, line){
  const minX = Math.min(line.p1[0], line.p2[0]);
  const maxX = Math.max(line.p1[0], line.p2[0]);
  
  const minY = Math.min(line.p1[1], line.p2[1]);
  const maxY = Math.max(line.p1[1], line.p2[1]);
  
  const x = point[0];
  const y = point[1];
    
  return (x <= maxX && x >= minX) && (y <= maxY && y >= minY)
}

function intersection(line1, line2){
    // check slopes of lines if they can intersect!!!
    const x1 = line1.p1[0];
    const y1 = line1.p1[1];
    const x2 = line1.p2[0];
    const y2 = line1.p2[1];
    const x3 = line2.p1[0];
    const y3 = line2.p1[1];
    const x4 = line2.p2[0];
    const y4 = line2.p2[1];
    
    const denom = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4);
    const px = ((x1*y2 - y1*x2)*(x3-x4) - (x1-x2)*(x3*y4 - y3*x4))/denom;
    const py = ((x1*y2 - y1*x2)*(y3-y4) - (y1-y2)*(x3*y4 - y3*x4))/denom;
    const intersectionPoint = [px, py];
    // check if this point is in range
    //console.log(`intersecton ${px} ${py}`)
   
    if(isPointInRange(intersectionPoint, line1) &&
       isPointInRange(intersectionPoint, line2)){
      return intersectionPoint;
    }
    
    return null;
}

class Line{
  constructor(p1x, p1y, p2x, p2y){ 
    this.p1 = [p1x, p1y]; 
    this.p2 = [p2x, p2y]; 
    this.points = [];
  }
}

const lines = [
  new Line(0, 0, 0, 200),
  new Line(0, 0, 120, 0),
  new Line(120, 0, 0, 200),
  new Line(0, 20, 100, 180),
  new Line(20, 0, 50, 180),
  new Line(100, 0, 50, 180)
];

const pointsSet = new Set();
const points = [];


lines.forEach(line1 => {
  drawLine(ctx, line1);
  
  lines.forEach(line2 => {
    if(line1 !== line2){
      const intersectionPoint = intersection(line1, line2);
      drawPoint(ctx, intersectionPoint, 'red');
      
      if(intersectionPoint && !pointsSet.has(intersectionPoint.toString())){
        line1.points.push(intersectionPoint.toString());
        line2.points.push(intersectionPoint.toString());
        pointsSet.add(intersectionPoint.toString());
        points.push(intersectionPoint);
      }
    }
  });
});

console.log('POINTS', points);
const pointIndexes = [];
points.forEach((_, index)=> pointIndexes.push(index));


// combinate points

function k_combinations(set, k) {
	var i, j, combs, head, tailcombs;
	
	// There is no way to take e.g. sets of 5 elements from
	// a set of 4.
	if (k > set.length || k <= 0) {
		return [];
	}
	
	// K-sized set has only one K-sized subset.
	if (k == set.length) {
		return [set];
	}
	
	// There is N 1-sized subsets in a N-sized set.
	if (k == 1) {
		combs = [];
		for (i = 0; i < set.length; i++) {
			combs.push([set[i]]);
		}
		return combs;
	}
	
	combs = [];
	for (i = 0; i < set.length - k + 1; i++) {
		// head is a list that includes only our current element.
		head = set.slice(i, i + 1);
		// We take smaller combinations from the subsequent elements
		tailcombs = k_combinations(set.slice(i + 1), k - 1);
		// For each (k-1)-combination we join it with the current
		// and store it to the set of k-combinations.
		for (j = 0; j < tailcombs.length; j++) {
			combs.push(head.concat(tailcombs[j]));
		}
	}
	return combs;
}

function combinations(set) {
	var k, i, combs, k_combs;
	combs = [];
	
	// Calculate all non-empty k-combinations
	for (k = 1; k <= set.length; k++) {
		k_combs = k_combinations(set, k);
		for (i = 0; i < k_combs.length; i++) {
			combs.push(k_combs[i]);
		}
	}
	return combs.filter(c=> c.length === 3);
}

const trCand = combinations(pointIndexes);

console.log('combined', trCand);

// check 

function areConnected(p1, p2) {
    // find a line contains both points
    for(let i=0; i<lines.length; i++){
      if( lines[i].points.indexOf(p1.toString()) > -1 &&
          lines[i].points.indexOf(p2.toString()) > -1 ) {
            return true;
          }
    }
    
    return false;
}

function areOnTheSameLine(p1, p2, p3){
  for(let i=0; i<lines.length; i++){
    if(lines[i].points.indexOf(p1.toString()) > -1 && 
       lines[i].points.indexOf(p2.toString()) > -1 && 
       lines[i].points.indexOf(p3.toString()) > -1) {
      return true;
    }
  }
  return false;
}

const colors = [
  'red',
  'green',
  'maroon',
  'blue',
  'orange',
  'purple',
  'magenta',
  'lime',
  'teal',
  'brown'
];

let triangles = [];

function getTriangle(t){
  const p1 = points[t[0]];
  const p2 = points[t[1]];
  const p3 = points[t[2]];
    
  if(areConnected(p1, p2) &&
     areConnected(p1, p3) &&
     areConnected(p2, p3)) {
    if(!areOnTheSameLine(p1,p2,p3)){
      console.log(`TRIANGLE ${p1} ${p2} ${p3}`);
     // drawTriangle(ctx, p1, p2, p3);  
      triangles.push([p1, p2, p3]);
    }
  }  
}   

trCand.forEach(t=> getTriangle(t));

function drawTriangle(ctx, p1, p2, p3, ci){
  ctx.beginPath();
  ctx.fillStyle = colors[ci];
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.lineTo(p3[0], p3[1]);
  ctx.fill();
}

function shiftPoint(p, dx, dy=0){
  return [p[0]+dx, p[1]+dy];
}

function drawTriangles(){
  
  triangles.forEach((t, index)=> {
    let p1 = shiftPoint(t[0], 150, -index*50);
    let p2 = shiftPoint(t[1], 150, -index*50);
    let p3 = shiftPoint(t[2], 150, -index*50);
    
    drawTriangle(ctx, p1, p2, p3, index);
  });
}

function clearScene(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  lines.forEach(line=> drawLine(ctx, line));
  points.forEach(point => drawPoint(ctx, point, 'red'));
}

function drawText(ctx, text){
  ctx.transform(1, 0, 0, -1, 0, canvas.height);
  ctx.font = "630px Arial";
  ctx.fillText(text, 200, 200);
  ctx.transform(1, 0, 0, -1, 0, canvas.height);
}

function drawTrianglesAnimated(){
  let triangleIndex = 0;
  
  let drawCurrentTriangle = function(index){
    let currentTtriangle = triangles[index];
    drawTriangle(ctx, ...currentTtriangle, index);
//    drawText(ctx, (triangleIndex+1).toString())
  }
  
  setInterval(function(){
      clearScene();
      drawCurrentTriangle(triangleIndex);
      triangleIndex = (triangleIndex + 1) % triangles.length;
  }, 700);
}

//
//drawTriangles();

drawTrianglesAnimated();

console.log(`HAS ${triangles.length} triangles!`);