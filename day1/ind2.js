
const fs = require("fs");

let count = 0;
let position = 50;


const calc = (pos, steps, dir) => {
  let newPos = pos;
  let crossings = 0;

  if (dir === "R") {
      crossings = Math.floor((pos + steps) / 100);
      newPos = (pos + steps) % 100;
  } else {
    crossings = Math.floor((steps - pos - 1) / 100) + 1;
    newPos = (pos - steps) % 100;
    newPos = (newPos + 100) % 100; // normalize negative
  }

  return { pos: newPos, crossings };
};

const brutForce = (pos, steps, dir) => {
    const increment = dir === "R" ? 1 : -1;        // Simulate every click
    for (let i = 0; i < steps; i++) {
	position = (position + increment + 100) % 100;
	if (position === 0) count++;
    }
    return { pos, count }
}


(() => {
  if (process.argv.length !== 3) {
    console.log("ERROR: expecting node index2.js [file]");
    process.exit(84);
  }

  const filePath = process.argv[2];
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      process.exit(1);
    }

    const lines = data.split(/\r?\n/);
    for (const line of lines) {
      const match = line.match(/^([LR])(\d+)$/);
      if (!match) continue;

      const dir = match[1];
      const steps = parseInt(match[2], 10);

      const res = calc(position, steps, dir);
      position = res.pos;
      count += res.crossings;
    }

    console.log("Result:", count);
  });
})();
