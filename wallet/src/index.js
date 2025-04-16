// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

import { Provider } from 'react-redux';      // 🔥 Add this
import store from './store/store';           // 🔥 Import your Redux store

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>                   {/* 🔥 Wrap App in Provider */}
    <App />
  </Provider>
);
