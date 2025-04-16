import { createSlice } from '@reduxjs/toolkit';

const graphSlice = createSlice({
  name: 'graph',
  initialState: {
    nodePositions: {},
  },
  reducers: {
    setNodePosition: (state, action) => {
      const { id, fx, fy } = action.payload;
      state.nodePositions[id] = { fx, fy };
    },
    setNodePositions: (state, action) => {
   
      state.nodePositions = { ...state.nodePositions, ...action.payload };
    },
  },
});

export const { setNodePosition, setNodePositions } = graphSlice.actions;
export default graphSlice.reducer;