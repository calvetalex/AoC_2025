const fs = require("fs");

// https://www.quora.com/How-do-I-find-the-area-of-a-rectangle-if-two-opposite-vertices-x1-y1-and-x2-y2-of-a-rectangle-are-given
const getArea = (p1, p2) => (Math.abs(p1.x - p2.x) + 1) * (Math.abs(p1.y - p2.y) + 1);
const getEdges = (coordinates) => {
  const edges = [];
  const size = coordinates.length;
  for (let i = 0; i < size; i++) {
    const a = coordinates[i];
    const b = coordinates[(i + 1) % size]; // as polygon is closed, loop over first element when reaching the end
    if (a.x !== b.x && a.y !== b.y) {
      throw new Error("ERROR: cannot build polygon with non adjacent points -> " + JSON.stringify(a) + " : " + JSON.stringify(b));
    }
    edges.push({p1: a, p2: b});
  }
  return edges;
}
const isOnEdge = (p, edge) => {
  const { p1, p2 } = edge;
  if (p1.y === p2.y) {
    // horizontal
    if (p.y !== p1.y) return false;
    const xmin = p1.x < p2.x ? p1.x : p2.x;
    const xmax = p1.x > p2.x ? p1.x : p2.x;
    return p.x >= xmin && p.x <= xmax;
  }
  // vertical
  if (p.x !== p1.x) return false;
  const ymin = p1.y < p2.y ? p1.y : p2.y;
  const ymax = p1.y > p2.y ? p1.y : p2.y;
  return p.y >= ymin && p.y <= ymax;
}
const isOnEdges = (p, edges) => {
  for (const e of edges) {
    if (isOnEdge(p, e)) return true;
  }
  return false;
}
const isInsideEdges = (p, edges) => {
  // https://rosettacode.org/wiki/Ray-casting_algorithm
  let crossings = 0;
  for (const e of edges) {
    // Only vertical edges contribute to +x ray casting
    if (e.p1.x !== e.p2.x) continue;
    const xEdge = e.p1.x;
    const ymin = e.p1.y < e.p2.y ? e.p1.y : e.p2.y;
    const ymax = e.p1.y > e.p2.y ? e.p1.y : e.p2.y;
    if (ymin <= p.y && p.y < ymax) {
      if (xEdge > p.x) {
        crossings += 1;
      }
    }
  }
  return crossings % 2 === 1;
}
const checkSegments = (xmin, xmax, ymin, ymax, edges) => {
  //up
  for (let i = xmin; i <= xmax; i++) {
    if (!isOnEdges({x: i, y: ymax}, edges) && !isInsideEdges({x: i, y: ymax}, edges)) return false;
  }
  // down
  for (let i = xmin; i <= xmax; i++) {
    if (!isOnEdges({x: i, y: ymin}, edges) && !isInsideEdges({x: i, y: ymin}, edges)) return false;
  }
  // left
  for (let i = ymin; i <= ymax; i++) {
    if (!isOnEdges({x: xmin, y: i}, edges) && !isInsideEdges({x: xmin, y: i}, edges)) return false;
  }
  // right
  for (let i = ymin; i <= ymax; i++) {
    if (!isOnEdges({x: xmax, y: i}, edges) && !isInsideEdges({x: xmax, y: i}, edges)) return false;
  }
  return true;
}


(() => {
  if (process.argv.length !== 3) {
    console.log("ERROR: expecting node index1.js <file>");
    process.exit(84);
  }
  const filePath = process.argv[2];
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    const lines = data.split(/\r?\n/);
    const points = [];
    let edges = [];
    let areas = new Map();
    for (const line of lines) {
      if (!line || line.length === 0) continue;
      const [x, y] = line.split(',').map(Number);
      points.push({ x, y });
    }
    edges = getEdges(points);
    const max = (points.length * (points.length - 1)) / 2;
    let seen = 0;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        seen++;
        const p1 = points[i];
        const p2 = points[j];
        console.log(`Testing :: ${JSON.stringify(p1)} -> ${JSON.stringify(p2)} :: ${Math.floor(seen * 100 / max)}% seen`);
        const xmin = p1.x < p2.x ? p1.x : p2.x;
        const xmax = p1.x > p2.x ? p1.x : p2.x;
        const ymin = p1.y < p2.y ? p1.y : p2.y;
        const ymax = p1.y > p2.y ? p1.y : p2.y;
        /*
        const corners = [
          { x: xmin, y: ymin },
          { x: xmin, y: ymax },
          { x: xmax, y: ymin },
          { x: xmax, y: ymax },
        ];
        
        for (const c of corners) {
          const onEdge = isOnEdges(c, edges);
          const inside = isInsideEdges(c, edges);
          if (!onEdge && !inside) {
            isValid = false;
            break;
          }
        }
        */
        if (xmin === xmax || ymin === ymax) continue;
        if (!checkSegments(xmin, xmax, ymin, ymax, edges)) continue;
        const key = `${JSON.stringify(p1)}-${JSON.stringify(p2)}`;
        if (areas.has(key)) continue;
        areas.set(key, getArea(p1, p2));
      }
    }
    //console.log(points);
    // console.log(areas);
    areas = new Map([...areas.entries()].sort((a, b) => b[1] - a[1]))
    console.log("Result: " + areas.entries().next().value);
  });
})()
