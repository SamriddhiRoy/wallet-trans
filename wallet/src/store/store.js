

import { configureStore } from '@reduxjs/toolkit';
import graphReducer from './graphSlice';

export const store = configureStore({
  reducer: {
    graph: graphReducer,
  },
});

export default store;
