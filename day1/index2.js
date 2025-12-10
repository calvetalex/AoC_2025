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
        crossings = Math.floor((steps + (100 - pos)) / 100);
        newPos = (pos - steps) % 100;
        newPos = (newPos + 100) % 100;
    }

    return { pos: newPos, crossings };
};

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
            const match = line.match(/^([A-Za-z])(\d+)$/);
            if (!match) continue;

            const dir = match[1];
            const steps = parseInt(match[2], 10);

	    // console.log(position, steps, dir);
            const res = calc(position, steps, dir);
            position = res.pos;
            count += res.crossings;
	    if (position === 0) count++;
        }

        console.log("Result: " + count);
    });
})();
