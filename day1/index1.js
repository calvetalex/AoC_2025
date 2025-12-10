const fs = require("fs")
let count = 0;
let position = 50;

const calc = (pos, index, dir) => {
    if (dir === "L") return (pos - index) % 100;
    return (pos + index) % 100;
}

(() => {
    if (process.argv.length !== 3) {
	console.log("ERROR: expecting node index1.js [file]");
	return 84;
    }
    const filePath = process.argv[2];

    
    fs.readFile(filePath, 'utf8', (err, data) => {
	if (err) {
            console.error('Error reading file:', err);
            process.exit(1);
	}
	const lines = data.split(/\r?\n/);
	
	const validRows = [];
	for (const line of lines) {
            const match = line.match(/^([A-Za-z])(\d+)$/);
            if (match) {
		const letter = match[1];
		const number = parseInt(match[2], 10);
		validRows.push({ letter, number: parseInt(number) });
            }
	}
	// console.log(validRows);
	for (line of validRows) {
	    // console.log(position, line.number, line.letter);
	    position = calc(position, line.number, line.letter);
	    // console.log(position);
	    if (position === 0) count++;
	}
	console.log("Result: " + count);
    });
    return 0;
})()
