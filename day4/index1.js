const fs = require("fs");

const directions = [
  [-1,-1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1]
];

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
    let lines = data.split(/\r?\n/).map(row => row.split(''));
    let res = 0;
    const rows = lines.length;
    if (!rows) {
      console.log("Empty file, nothing to check\n");
      process.exit(0);
    }
    const cols = lines[0].length;
    const operation = (data, overwrite = true) => {
      let count = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (data[r][c] === '@') {
            let adjacent = 0;
            for (const [dr, dc] of directions) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && (data[nr][nc] === '@' || data[nr][nc] === 'x'))
                adjacent++;
            }
            if (adjacent < 4) {
              if (overwrite) data[r][c] = 'x';
              count++;
            }
          }
        }
      }
      return count;
    }
    console.log("Part1:   " + operation(lines, false)); 
    let isSame = false;
    while (!isSame) {
      let c = operation(lines);
      if (c === 0) isSame = true;
      res+= c;
      lines = lines.map(row => row.map(e => e === 'x' ? '.' : e));
      // console.log(c + " boxed removed\n");
      // console.log(lines.map(row => row.join('')).join('\n'));
    }
    console.log("Result:  " + res);
  });
})()
