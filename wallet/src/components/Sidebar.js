import React, { useState } from "react";


const Sidebar = ({ selectedAddress, data, onToggleNode, addedNodes }) => {
  const [activeTab, setActiveTab] = useState("inflow");

  if (!selectedAddress || !data) return null;

  const renderList = (items, type) =>
    items.map((item, index) => {
      const isAdded = addedNodes.includes(item.address);
      return (
        <div key={`${type}-${index}`} className="tx-item">
          <div className="tx-details">
            <span className="tx-address">{item.address}</span><br />
            <span className="tx-meta">
             
            </span>
          </div>
          <button
            onClick={() => onToggleNode(item.address, type)}
            className={isAdded ? "active" : ""}
          >
            {isAdded ? "−" : "+"}
          </button>
        </div>
      );
    });

  return (
    <div className="sidebar">
      <div className="tabs">
        <div
          className={`tab ${activeTab === "inflow" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("inflow")}
        >
          INFLOWS
        </div>
        <div
          className={`tab ${activeTab === "outflow" ? "active-tab" : ""}`}
          onClick={() => setActiveTab("outflow")}
        >
          OUTFLOWS
        </div>
      </div>

      <div className="tab-content">
        {activeTab === "inflow" ? renderList(data.inflows, "inflow") : renderList(data.outflows, "outflow")}
      </div>
    </div>
  );
};

export default Sidebar;

