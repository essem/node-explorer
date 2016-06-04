import { createStore, combineReducers } from 'redux';
import { Provider } from 'react-redux';
import alertReducer from './reducers/alert';
import bookmarksReducer from './reducers/bookmarks';
import locReducer from './reducers/loc';
import filesReducer from './reducers/files';
import previewReducer from './reducers/preview';
import React from 'react';
import ReactDOM from 'react-dom';

// Uncomment to check performance
// window.Perf = require('react-addons-perf');

import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './public/style.css';
import App from './components/app';

const store = createStore(
  combineReducers({
    alert: alertReducer,
    bookmarks: bookmarksReducer,
    loc: locReducer,
    files: filesReducer,
    preview: previewReducer,
  }),
  undefined,
  window.devToolsExtension ? window.devToolsExtension() : undefined
);

const app = document.createElement('div');
document.body.appendChild(app);

ReactDOM.render((
  <Provider store={store}>
    <App />
  </Provider>
), app);
