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
  return { diagram, buttons: extractButtons(buttons), jolts }; 
}

const createDiagramBitmask = (diagram) => {
  let target = 0;
  for (let i = 0; i < diagram.length; i++) {
    if (diagram[i] === '#') target |= (1 << i);
  }
  return target;
}

const createButtonBitmask = (buttons) => {
  const bButtons = [];
  let target = 0;
  buttons.forEach((button) => {
    const indices = button.split(',');
    for (const b of indices) {
      const value = parseInt(b);
      if (!Number.isNaN(value)) {
        target |= (1 << value);
      }
    }
    bButtons.push(target);
    target = 0;
  });
  return bButtons;
}

/*
  Breadth First search -> https://www.codecademy.com/article/breadth-first-search-bfs-algorithm
*/
const bfs = (target, lightsLen, bButtons) => {
  // align start and target on unsigned to avoid overflow
  const start = 0 >>> 0;
  target = target >>> 0;

  if (target === start) return 0;
  if (!bButtons || bButtons.length === 0) return null;

  // define the maximum states possible
  const max = 1 << lightsLen;
  // initialize dist and queue to max
  const dist = new Int32Array(max).fill(-1);
  const queue = new Uint32Array(max);
  let head = 0;
  let tail = 0;

  dist[start] = 0; // init count for first try
  queue[tail++] = start; // init queue to 0 for first write

  while (head !== tail) { // while we have to visit state
    const s = queue[head++]; // get state and go on next state
    const d = dist[s]; // get current state number (count)

    for (const bm of bButtons) {
      const ns = (s ^ bm) >>> 0; // XOR on bitmasks to apply buttons
      if (dist[ns] === -1) { // if next state has not been visited yet
        dist[ns] = d + 1; // write it as visited
        if (ns === target) return dist[ns];
        queue[tail++] = ns; // add current state to queue to continue
      }
    }
  }
  return null; // target unreachable
}

const operation = (machine) => {
  // console.log("Parsing :: " + JSON.stringify(machine));
  const bDiagram = createDiagramBitmask(machine.diagram);
  const bButtons = createButtonBitmask(machine.buttons);
  // console.log(`Diagram :: ${machine.diagram} -> ${bDiagram.toString(2)}`);
  // console.log("Buttons ::");
  // bButtons.forEach((b, idx) => console.log(`${machine.buttons[idx]} -> ${b.toString(2)}`));
  return bfs(bDiagram, machine.diagram.length, bButtons);
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
    // console.log(machines)
    const res = [];
    for (const machine of machines) {
      const r = operation(machine);
      // console.log(`machine ${machine.diagram} :: ${r}`);
      if (!r) {
        console.log(`No solution found for ${machine.diagram}`);
        continue;
      }
      res.push(r);
    }
    console.log("Result :: " + res.reduce((acc, curr) => acc + curr, 0));
  });
})()
