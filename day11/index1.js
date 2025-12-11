const fs = require("fs");
const regLine = new RegExp(/^(?<name>[^:]+):\s*(?<links>.*)$/);

const createGraph = (lines) => {
  const graph = new Map();

  for (const line of lines) {
    const m = line.match(regLine);
    if (!m) {
      console.log("Error:: invalid line : " + line);
      continue;
    }
    const { name, links } = m.groups;
    const children = links.length ? links.split(' ').filter(e => !!e).map(s => s.trim()) : [];
    // save node as parent to be able to read in both directions
    for (const child of children) {
      if (graph.has(child)) graph.get(child).parent.push(name);
      else graph.set(child, { children: [], parent: [name] }); 
    }
    if (graph.has(name)) {
      const node = graph.get(name);
      node.children = children;
    } else {
      graph.set(name, { children, parent: [] });
    }
  }
  // has out is not define in keys but is necessary, we check that each children has a key in graph
  for (const [,{ children }] of graph) {
    for (const child of children) {
      if (!graph.has(child)) graph.set(child, []);
    }
  }
  return graph;
}

const operation = (graph, start='you', goal='out', direction='des') => {
  if (!graph.has(start)) throw new Error(`Missing starting node "${start}"`);
  if (!graph.has(goal)) throw new Error(`Missing ending node "${goal}"`);
  console.log(`Looking to reach ${goal} from ${start}`);
  const res = [];
  const path = [];
  const pathSet = new Set();
  // https://www.codecademy.com/article/depth-first-search-dfs-algorithm
  const dfs = (node) => {
    path.push(node);
    pathSet.add(node);
    try {
      if (node === goal) {
        res.push([...path]);
        process.stdout.write("new path found :: total " + res.length + "\r")
        return;
      }
      const { children, parent } = graph.get(node);
      const following = direction === 'des' ? children : parent;
      for (const next of following) {
        if (pathSet.has(next)) continue;
        dfs(next);
      }
    } finally {
      path.pop();
      pathSet.delete(node);
    }
  }
  dfs(start);
  process.stdout.write('\x1b[2K');
  process.stdout.write('\r');
  console.log("Paths found: " + res.length);
  return res;
}

const areNodeConnected = (graph, n1, n2) => {
  if (!graph.has(n1) || !graph.has(n2)) return false;
  const queue = [n1];
  const visited = new Set([n1]);

  while (queue.length) {
    const node = queue.shift();
    if (node === n2) return true;
    const { children } = graph.get(node) || [];
    for (const next of children) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
  return false;
}

(() => {
  if (process.argv.length !== 4) {
    console.log("ERROR: expecting node index1.js <file> <part>\n\tfile:\tpath to the input\n\tpath:\t1|2 base on which part you want to calcul");
    process.exit(84);
  }
  const filePath = process.argv[2];
  const part = parseInt(process.argv[3]);
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    const lines = data.split(/\r?\n/).filter(l => !!l && l.length);
    const graph = createGraph(lines);
    // console.log(graph);
    try {
      if (part === 1) {
        const res = operation(graph);
        // res.forEach(p => console.log(p.join(',')));
        console.log("Result  :: " + res.length);
      } else {
        // check which node is in first between dac and fft
        console.log("Identifying first node to reach...");
        const fftToDac = areNodeConnected(graph, 'fft', 'dac');
        const dacToFft = areNodeConnected(graph, 'dac', 'fft');
        console.log(`fft->dac :: ${fftToDac}\ndac->fft :: ${dacToFft}`);
        console.log("Get the number of paths between those nodes...");
        const middle = {
          fftToDac: [],
          dacToFft: [],
        }
        if (fftToDac) middle.fftToDac = operation(graph, 'dac', 'fft', 'asc');
        if (dacToFft) middle.dacToFft = operation(graph, 'fft', 'dac', 'asc');
        // check how many paths reach out from last node
        console.log("Finding number of path leading to out...");
        const endings = {
          fftToDac: [],
          dacToFft: [],
        };
        if (fftToDac) endings.fftToDac = operation(graph, 'dac', 'out');
        if (dacToFft) endings.dacToFft = operation(graph, 'fft', 'out');
        // check how many paths reach the first node
        console.log("Finding number of path leading to the first node...");
        const landings = {
          fftToDac: [],
          dacToFft: [],
        };
        if (fftToDac) landings.fftToDac = operation(graph, 'fft', 'svr', 'asc');
        if (dacToFft) landings.dacToFft = operation(graph, 'dac', 'svr', 'asc');
        console.log(`All cases find ::`);
        console.log(`\tfft->dac:\tendings: ${endings.fftToDac.length}, svr->fft: ${landings.fftToDac.length}, fft->dac: ${middle.fftToDac.length} = ${endings.fftToDac.length * landings.fftToDac.length * middle.fftToDac.length}`);
        console.log(`\tfft->dac:\tendings: ${endings.dacToFft.length}, svr->fft: ${landings.dacToFft.length}, dac->fft: ${middle.dacToFft.length} = ${endings.dacToFft.length * landings.dacToFft.length * middle.dacToFft.length}`);
        console.log("Result2 :: " + (endings.fftToDac.length * landings.fftToDac.length * middle.fftToDac.length + endings.dacToFft.length * landings.dacToFft.length * middle.dacToFft.length));
      }
    } catch(e) {
      console.log(e);
      process.exit(1);
    }
  });
})()
