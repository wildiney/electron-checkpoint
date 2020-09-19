/* eslint react/jsx-props-no-spreading: off */
import React from 'react';
import { Switch, Route } from 'react-router-dom';
import routes from './constants/routes.json';
import App from './containers/App';
import CheckpointPage from './containers/CheckpointPage';

// Lazily load routes and code split with webpack
// const LazyCounterPage = React.lazy(() =>
// import(/* webpackChunkName: "CounterPage" */ './containers/CounterPage')
// );


export default function Routes() {
  return (
    <App>
      <Switch>
        <Route path={routes.HOME} component={CheckpointPage} />
      </Switch>
    </App>
  );
}
