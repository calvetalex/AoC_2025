const fs = require("fs");

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
    const lines = data.split(/\r?\n/).filter(e => !!e);
    const height = lines.length;
    const width = lines[0].length;
    // found start
    let start = { row: 0, col: 0, found: false};
    for (let r = 0; r < height && !start.found; r++) {
      for (let c = 0; c < width; c++) {
        if (lines[r][c] === 'S') {
          start = { row: r, col: c, found: true };
          break;
        }
      }
    }
    // dictionnary to not count multiple times the splitter
    let memo = new Map();
    const isInsideGrid = (r, c) => r>= 0 && r < height && c >= 0 && c < width;

    const operation = (r, c, countSplit) => {
      if (!isInsideGrid(r, c)) return 0;
      const key = `${r},${c}`;
      if (memo.has(key)) {
        return countSplit ? 0 : memo.get(key);
      }
      const ch = lines[r][c];
      let res = 0;
      if (ch === '^') {
        res = 1 + operation(r, c - 1, countSplit) + operation(r, c + 1, countSplit);
      } else {
        res = operation(r + 1, c, countSplit);
      }
      memo.set(key, res);
      return res;
    };

    console.log("Result:  " + operation(start.row + 1, start.col, true));
    memo = new Map();
    console.log("Result2: " + (operation(start.row + 1, start.col, false) + 1));
  });
})()
