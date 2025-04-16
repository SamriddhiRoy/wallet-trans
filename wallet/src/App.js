import React, { useState } from "react";
import Graph from "./components/Graph";
import Sidebar from "./components/Sidebar";
import { mockInflowOutflowData } from "./data/mockData";
import "./styles.css";

const App = () => {
  const [searchAddress, setSearchAddress] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphLinks, setGraphLinks] = useState([]);
  const [addedNodes, setAddedNodes] = useState([]);

  const handleSearch = () => {
    if (!mockInflowOutflowData[searchAddress]) return;
    const baseNode = { id: searchAddress };
    setGraphNodes([baseNode]);
    setGraphLinks([]);
    setSelectedAddress(searchAddress);
    setAddedNodes([]);
  };

  const handleToggleNode = (address, type) => {
    const data = mockInflowOutflowData[selectedAddress];
    const existing = addedNodes.includes(address);

    if (existing) {
      setGraphNodes(prev => prev.filter(n => n.id !== address));
      setGraphLinks(prev =>
        prev.filter(
          l =>
            (typeof l.source === "string" ? l.source : l.source.id) !== address &&
            (typeof l.target === "string" ? l.target : l.target.id) !== address
        )
      );
      setAddedNodes(prev => prev.filter(a => a !== address));
    } else {
      const tx = [...(data.inflows || []), ...(data.outflows || [])].find(tx => tx.address === address);
      const label = tx?.label || null;
      setGraphNodes(prev => [...prev, { id: address, label }]);
      setGraphLinks(prev => [
        ...prev,
        {
          source: type === "inflow" ? address : selectedAddress,
          target: type === "inflow" ? selectedAddress : address,
          amount: tx.amount,
          timestamp: tx.timestamp,
        },
      ]);
      setAddedNodes(prev => [...prev, address]);
    }
  };

  return (
    <div className="app-container">
      <div className="topbar">
        <input
          type="text"
          placeholder="Enter address"
          value={searchAddress}
          onChange={(e) => setSearchAddress(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
        <button
          className="download-btn"
          onClick={() => window.dispatchEvent(new Event("download-svg"))}
        >
          Download SVG
        </button>
      </div>

      <div className="content">
        <Sidebar
          selectedAddress={selectedAddress}
          data={mockInflowOutflowData[selectedAddress]}
          onToggleNode={handleToggleNode}
          addedNodes={addedNodes}
        />
        <Graph nodes={graphNodes} links={graphLinks} />
      </div>
    </div>
  );
};

export default App;

