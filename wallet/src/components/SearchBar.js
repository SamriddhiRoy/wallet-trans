import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    if (input) onSearch(input.trim());
  };

  return (
    <div className="p-2 bg-gray-800 text-white">
      <input
        className="p-2 rounded bg-gray-700 w-64"
        placeholder="Enter wallet address"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
      />
      <button onClick={handleSearch} className="ml-2 bg-blue-500 px-3 py-1 rounded">
        Search
      </button>
    </div>
  );
};

export default SearchBar;
