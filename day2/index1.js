const fs = require("fs")
const reg = new RegExp(/^(\d+)\1$/);
const reg2 = new RegExp(/^(\d+)\1+$/)

const check_range = (range, regex) => {
    const rangeData = range.split("-");
    const res = [];

    if (rangeData.length && rangeData.length < 2) return [rangeData[0].match(regex) ? rangeData[0] : null].filter(e => !!e);
    const start = parseInt(rangeData[0]);
    const end = parseInt(rangeData[1]);
    for (let i = start; i <= end; i++) {
	if (String(i).match(regex)) {
	    res.push(i);
	}
    }
    return res;
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
	let res = [];
	let res2 = [];
	for (const line of lines) {
	    const ranges = line.split(',');
	    ranges.forEach(r => {
		res = [...res, ...check_range(r, reg)];
		res2 = [...res2, ...check_range(r, reg2)];
	    });
	}
	// console.log(JSON.stringify(res));
	console.log("Result:  " + res.reduce((acc, curr) => acc + curr, 0));
      console.log("Result2: " + res2.reduce((acc, curr) => acc + curr, 0));
    });
})()
