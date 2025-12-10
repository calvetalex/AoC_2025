const fs = require("fs");
const lineRegex = new RegExp(/^\s*\[(?<diagram>[.#]+)\]\s*(?<buttons>(?:\(\s*\d+(?:\s*,\s*\d+)*\s*\)\s*)+)\s*\{(?<jolts>\s*\d+(?:\s*,\s*\d+)*\s*)\}\s*$/);
const buttonRegex = new RegExp(/\(\s*(?<indices>\d+(?:\s*,\s*\d+)*)\s*\)/g);

const extractButtons = (buttonsString) => {
  const buttons = [];
  const ms = buttonsString.matchAll(buttonRegex);
  for (const m of ms) {
    buttons.push(m.groups.indices);
  }
  return buttons;
}

const extractLineInformation = (line) => {
  const m = line.match(lineRegex);
  if (!m) throw new Error("Invalid line :: " + line);
  const { diagram, buttons, jolts } = m.groups;
  return {
    diagram,
    buttons: extractButtons(buttons).map(e => e.split(',').map(Number)),
    jolts: jolts.split(',').map(Number)
  }; 
}

/*
  Breadth First search -> https://www.codecademy.com/article/breadth-first-search-bfs-algorithm
*/
const bfs = (target, joltsLen, buttons) => {
  const start = new Array(joltsLen).fill(0);
  const targetTag = target.join(',');
  
  if (target.length === 0) return 0;
  if (!buttons || buttons.length === 0) return null;
  
  const queue = [];
  let head = 0;
  const seen = new Set();

  seen.add(start.join(','));
  queue.push({ state: start, dist: 0 });
  
  while (head !== queue.length) { // while we have to visit state
    const { state, dist } = queue[head++]; // get state and go on next state
    for (const bs of buttons) {
      const ns = [...state]; // copy of state to keep it safe in queue 
      let isValid = true;
      for (const b of bs) { // for each jolt impacted by the button tupple
        ns[b]++; // increment the jolt at place b;
        if (ns[b] > target[b]) { // check that we are still below target
          isValid = false;
          break;
        }
      }
      if (!isValid) continue; // we went over the target
      const nsTag = ns.join(',');
      if (seen.has(nsTag)) continue;
      if (nsTag === targetTag) return dist + 1;
      seen.add(nsTag);
      queue.push({ state: ns, dist: dist + 1 }); // add next state
    }
  }
  return null; // target unreachable
}

const operation = (machine) => {
  console.log("Parsing :: " + JSON.stringify(machine));
  return bfs(machine.jolts, machine.jolts.length, machine.buttons);
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
    const machines = [];
    
    for (const line of lines) {
      if (!line || line.length === 0) continue;
      try {
        machines.push(extractLineInformation(line));
      } catch(e) {
        console.log(e);
        continue;
      }
    }
    const res = [];
    for (const machine of machines) {
      const r = operation(machine);
      console.log(`machine ${machine.jolts.join(',')} :: ${r}`);
      if (!r) {
        console.log(`No solution found for ${machine.jolts.join(',')}`);
        continue;
      }
      res.push(r);
    }
    console.log("Result :: " + res.reduce((acc, curr) => acc + curr, 0));
  });
})()
