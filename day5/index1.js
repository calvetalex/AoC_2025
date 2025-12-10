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
    const lines = data.split(/\r?\n/);
    const blankLine = lines.findIndex(l => l === "");
    const ranges = lines.slice(0, blankLine);
    const aliments = lines.slice(blankLine + 1).map(e => parseInt(e));
    const availableAlimentsRanges = ranges.map(r => {
      const [min, max] = r.split('-').map(Number);
      return [min, max];
    });
    // overlaps management
    availableAlimentsRanges.sort((a, b) => a[0] - b[0]);
    const availableAlimentsRangeWithoutOverlaps = [availableAlimentsRanges[0]];
    console.log(availableAlimentsRangeWithoutOverlaps);
    for (const [min, max] of availableAlimentsRanges) {
      const last = availableAlimentsRangeWithoutOverlaps[availableAlimentsRangeWithoutOverlaps.length - 1];
      console.log(last)
      if (min <= last[1] + 1) {
        last[1] = Math.max(last[1], max);
      } else {
        availableAlimentsRangeWithoutOverlaps.push([min, max]);
      }
    };
    console.log(availableAlimentsRangeWithoutOverlaps)
    
    const freshAliments = [];
    
    aliments.forEach(a => {
      if (availableAlimentsRanges.some(([min, max]) => min <= a && max >= a)) freshAliments.push(a);
    });

    //console.log(availableAliments);
    //console.log(freshAliments);
    console.log("Result1:  " + freshAliments.length);
    console.log("Result2:  " + availableAlimentsRangeWithoutOverlaps.reduce((acc, [min, max]) => (max - min + 1) + acc, 0));
  });
})()
