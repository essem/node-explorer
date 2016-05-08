import React from 'react';
import ReactDOM from 'react-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.css';
import './public/style.css';
import App from './components/app';

const app = document.createElement('div');
document.body.appendChild(app);

ReactDOM.render(<App />, app);
