const fs = require("fs");

function Problem(values = [], operator = '+') {
  this.values = values;
  this.operator = operator;
}
Problem.prototype.getOperation = function () {
  switch (this.operator) {
    case '+':
      return (x, y) => x + y;
    case '-':
      return (x, y) => x - y;
    case '*':
      return (x, y) => x * y;
    case '/':
      return (x, y) => x / y;;
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
    let res = 0;
    const datas = [];
    const values = [];
    const operations = [];
    // parse data to get an array of each line
    for (const line of lines) {
      if (!line || line.lenght === 0) continue;
      datas.push(line.split(' ').filter(e => !!e).map(e => isNaN(e) ? e : Number(e)));
    }
    //console.log(datas);
    // for each line, create an array that will regroup each column
    for (const line of datas) {
      if (!values.length) {
        // console.log("init values");
        line.forEach(number => values.push([number]));
        // console.log(values);
      } else {
        for (let i = 0; i < line.length; i++) {
          // console.log(values[i]);
          values[i].push(line[i]);
        }
      }
    }
    // console.log(values);
    // create array of Problem
    for (const line of values) {
      const subValues = line.filter(e => !isNaN(e));
      const op = line.find(e => isNaN(e));
      // console.log(subValues);
      // console.log(op);
      operations.push(new Problem(subValues, op));
    }
    // console.log(operations);
    operations.forEach(prob => {
      // console.log(prob, prob.calcul());
      res += prob.calcul();
    });
    console.log("Result:  " + res);
  });
})()
