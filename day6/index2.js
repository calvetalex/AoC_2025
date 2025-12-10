const fs = require("fs");

function Problem(values = [], operator = "+") {
  this.values = values;
  this.operator = operator;
}
Problem.prototype.getOperation = function () {
  switch (this.operator) {
    case "+": return (x, y) => x + y;
    case "-": return (x, y) => x - y;
    case "*": return (x, y) => x * y;
    case "/": return (x, y) => x / y;
    default:
      throw new Error(`Unsupported operator: ${this.operator}`);
  }
};
Problem.prototype.calcul = function () {
  const op = this.getOperation();
  const [initial, ...rest] = this.values;
  return rest.reduce((acc, value) => op(acc, value), initial);
};

(() => {
  if (process.argv.length !== 3) {
    console.log("ERROR: expecting node index.js <file>");
    process.exit(84);
  }

  const filePath = process.argv[2];
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    const lines = data.split(/\r?\n/).filter(e => !!e);
    const opsLine = lines[lines.length - 1].split(' ').filter(e => !!e).reverse();
    const numberLines = lines.slice(0, -1);

    const rows = numberLines.length;
    const cols = numberLines[0].length;

    const problemsValues = [[]];

    for (let c = cols - 1; c >= 0; c--) {
      const isBlankCol = numberLines.every(row => row[c] === ' ');
      if (isBlankCol) {
        const last = problemsValues[problemsValues.length - 1];
        if (last.length > 0) {
          problemsValues.push([]);
        }
        continue;
      }

      let vertical = '';
      for (let r = 0; r < rows; r++) {
        const ch = numberLines[r][c];
        vertical += (ch >= '0' && ch <= '9') ? ch : '0';
      }
      vertical = vertical.replace(/(?!$)0+$/, '');
      problemsValues[problemsValues.length - 1].push(Number(vertical));
    }

    const problems = problemsValues.map((vals, i) => new Problem(vals, opsLine[i]));
    let res = 0;
    problems.forEach((prob, idx) => {
      const result = prob.calcul();
      console.log(`Problem ${idx + 1} from the right: ${prob.values.join(` ${prob.operator} `)} = ${result}`);
      res += result;
    });
    console.log("Result: ", res);
  });
})();
