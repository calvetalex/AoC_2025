const fs = require("fs");

const getDistance = (p1, p2) => {
  return Math.sqrt((Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2)));
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
    const junctions = [];
    let circuits = [];
    let distances = new Map();
    
    for (const line of lines) {
      if (!line || line.length === 0) continue;
      const [x, y, z] = line.split(',').map(Number);
      junctions.push({x, y, z});
    }
    for (let i = 0; i < junctions.length; i++) {
      circuits.push([i]);
    }
    //console.log(junctions);
    console.log(junctions.length + " points found");
    for (let i = 0; i < junctions.length; i++) {
      for (let j = i + 1; j < junctions.length; j++) {
        const key = `${i},${j}`;
        if (distances.has(key)) continue;
        distances.set(key, getDistance(junctions[i], junctions[j]));
      }
    }
    console.log(distances.size + " junctions has been created");
    // console.log(distances);
    distances = new Map([...distances.entries()].sort((a, b) => a[1] - b[1]));
    const part1 = (arr) => {
      let seen = 1;
      for (const d of distances.keys()) {
        if (seen === 1000) break;
        seen++;
        const points = d.split(',').map(Number);
        const c1 = arr.findIndex(links => links.some(l => l === points[0]));
        const c2 = arr.findIndex(links => links.some(l => l === points[1]));
        // console.log(points, c1, c2);
        if (c1 === c2) continue;
        else {
          arr = arr.map((c, idx) => {
            if (idx === c1) return [...c, ...arr[c2]];
            if (idx === c2) return null;
            return c;
          }).filter(e => !!e);
        }
      }
      arr = arr.sort((a, b) => b.length - a.length);
      console.log(arr.length + " circuits created : ");
      arr.forEach((c, idx) => console.log(`circuit${idx} :: ${c.length}`));
      // console.log(circuits);
      // console.log(distances);
      console.log("Result1: " + arr[0].length * arr[1].length * arr[2].length);
    };

    const part2 = (arr) => {
      let lastPoints = [];
      for (const d of distances.keys()) {
        if (arr.length === 1) {
          break;
        }
        const points = d.split(',').map(Number);
        const c1 = arr.findIndex(links => links.some(l => l === points[0]));
        const c2 = arr.findIndex(links => links.some(l => l === points[1]));
        // console.log(points, c1, c2);
        if (c1 === c2) continue;
        else {
          arr = arr.map((c, idx) => {
            if (idx === c1) return [...c, ...arr[c2]];
            if (idx === c2) return null;
            return c;
          }).filter(e => !!e);
          lastPoints = points;
        }
      }
      // console.log(circuits);
      // console.log(distances);
      console.log("Result2: " + junctions[lastPoints[0]].x * junctions[lastPoints[1]].x);
    };
    
    part1([...circuits.map(e => [...e])]);
    part2([...circuits.map(e => [...e])]);
  });

})()
