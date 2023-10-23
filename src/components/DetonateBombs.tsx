import React, { useState } from "react";
import * as d3 from "d3";
import "./styles/detonate.css";

type Bomb = [number, number, number];

function App() {
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [output, setOutput] = useState<number | null>(null);

  const handleAddBomb = () => {
    const x = parseFloat(prompt("Enter X-coordinate:") || "");
    const y = parseFloat(prompt("Enter Y-coordinate:") || "");
    const r = parseFloat(prompt("Enter Radius:") || "");
    if (!isNaN(x) && !isNaN(y) && !isNaN(r)) {
      setBombs([...bombs, [x, y, r]]);
    }
  };

  const handleDetonate = () => {
    const maxDetonatedBombs = detonateMaximumBomb(bombs);
    setOutput(maxDetonatedBombs);

    // Create a D3 visualization of the detonations
    createD3Visualization(bombs, maxDetonatedBombs);
  };

  function detonateMaximumBomb(bombs: Bomb[]): number {
    const n = bombs.length;
    const graph: number[][] = new Array(n).fill(0).map(() => []);
    
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          const [x1, y1, r1] = bombs[i];
          const [x2, y2, r2] = bombs[j];
          const distance = Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
          
          if (distance <= r1) {
            graph[i].push(j);
          }
        }
      }
    }
  
    let maxDetonatedBombs = 0;
  
    for (let i = 0; i < n; i++) {
      const visited = new Set<number>();
      const stack: number[] = [];
      
      stack.push(i);
      
      while (stack.length > 0) {
        const node = stack.pop() as number;
        
        if (!visited.has(node)) {
          visited.add(node);
          
          for (const neighbor of graph[node]) {
            stack.push(neighbor);
          }
        }
      }
      
      maxDetonatedBombs = Math.max(maxDetonatedBombs, visited.size);
    }
    
    return maxDetonatedBombs;
  }

  const createD3Visualization = (bombs: Bomb[], maxDetonatedBombs: number) => {
    const width = 500;
    const height = 500;
    const svg = d3.select("#visualization").attr("width", width).attr("height", height);
  
    // Clear previous visualization
    svg.selectAll("*").remove();
  
    // Draw the bombs
svg
.selectAll("circle.bomb")
.data(bombs)
.enter()
.append("circle")
.attr("cx", (d) => d[0])
.attr("cy", (d) => d[1])
.attr("r", (d) => d[2])
.style("fill", "blue")
.style("stroke", "black") // Set the border color to black
.style("stroke-width", 2); // Set the border width (adjust as needed)

// Draw the centers of the bombs (small black circles)
svg
.selectAll("circle.center")
.data(bombs)
.enter()
.append("circle")
.attr("cx", (d) => d[0])
.attr("cy", (d) => d[1])
.attr("r", 2) // Small radius for the center circle
.style("fill", "black"); // Set the center color to black

// Draw the detonated bombs with individual color transitions
svg
.selectAll("circle.detonated")
.data(bombs.slice(0, maxDetonatedBombs))
.enter()
.append("circle")
.attr("cx", (d) => d[0])
.attr("cy", (d) => d[1])
.attr("r", (d) => d[2])
.style("fill", "blue")
.style("stroke", "black") // Set the border color to black
.style("stroke-width", 2) // Set the border width (adjust as needed)
.style("fill-opacity", 0.5)
.transition()
.duration(5000) // Duration of the transition in milliseconds
.style("fill", "red")
.style("fill-opacity", 0.5);
  };

  return (
    <div className="App">
      <h1>Detonate Bombs</h1>
      <button onClick={handleAddBomb}>Add Bomb</button>
      <button onClick={handleDetonate}>Detonate Bombs</button>
      <div className="input-output">
        <div className="input">
          <h2>Input Bombs:</h2>
          <ul>
            {bombs.map((bomb, index) => (
              <li key={index}>
                Bomb {index + 1}: (X: {bomb[0]}, Y: {bomb[1]}, Radius: {bomb[2]})
              </li>
            ))}
          </ul>
        </div>
        <div className="output">
          <h2>Maximum Detonated Bombs:</h2>
          {output !== null ? <p>{output}</p> : <p>Result will be displayed here</p>}
        </div>
      </div>
      <svg id="visualization" width="500" height="500"></svg>
    </div>
  );
}

export default App;
