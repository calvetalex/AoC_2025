const fs = require("fs");

const operation = (line) => {
  let maxJoltage = 0;
  const digits = line.trim().split("");

  for (let i = 0; i < digits.length; i++) {
    if (parseInt(digits[i]) <= maxJoltage / 10) continue;
    for (let j = i + 1; j < digits.length; j++) {
      const value = parseInt(digits[i] + digits[j]);
      if (value > maxJoltage) {
        maxJoltage = value;
      }
    }
  }
  return maxJoltage;
};

const part2 = (digits, idx = 12) => {
  if (idx === 0 || digits.length === 0) return "";

  let maxIdx = 0;
  for (let i = 0; i <= digits.length - idx; i++) {
    if (digits[i] > digits[maxIdx]) {
      maxIdx = i;
    }
  }
  return digits[maxIdx] + part2(digits.slice(maxIdx + 1), idx - 1);
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
    let res = 0;
    let res2 = 0;
    for (const line of lines) {
      if (!line || line.lenght === 0) continue;
      res += operation(line);
      // console.log('"' + line + '"');
      res2 += parseInt(part2(line.split("")));
      // console.log("Max number part 2: " + res2);
    }
    console.log("Result:  " + res);
    console.log("Result2: " + res2);
  });
})()
