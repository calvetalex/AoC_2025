const fs = require("fs");

// https://www.quora.com/How-do-I-find-the-area-of-a-rectangle-if-two-opposite-vertices-x1-y1-and-x2-y2-of-a-rectangle-are-given
const getArea = (p1, p2) => (Math.abs(p1.x - p2.x) + 1) * (Math.abs(p1.y - p2.y) + 1);

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
    let areas = new Map();
    for (const line of lines) {
      if (!line || line.length === 0) continue;
      const [x, y] = line.split(',');
      points.push({ x, y });
    }
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const key = `${JSON.stringify(points[i])}-${JSON.stringify(points[j])}`;
        if (areas.has(key)) continue;
        areas.set(key, getArea(points[i], points[j]));
      }
    }
    //console.log(points);
    //console.log(areas);
    areas = new Map([...areas.entries()].sort((a, b) => b[1] - a[1]))
    console.log("Result: " + areas.entries().next().value);
  });
})()
