import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import App from './containers/App'
import ConfigPage from './containers/ConfigPage/ConfigPage'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
// import Routes from './Routes';
import './app.global.css';
import CheckpointPage from './containers/CheckpointPage';

document.addEventListener('DOMContentLoaded', () => {
  render(
    <App>
      <Router>
        <Switch>
          <Route path="/config">
            <ConfigPage />
          </Route>
          <Route path="/">
            <CheckpointPage />
          </Route>
        </Switch>
      </Router>
    </App>,
    document.getElementById('root')
  );
});
