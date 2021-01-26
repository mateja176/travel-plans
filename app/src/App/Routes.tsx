import React from 'react';
import { Route, Switch } from 'react-router-dom';
import NotFound from '../components/NotFound';
import { useCanCrudUsers, useRoutes } from '../hooks/auth';
import { UserRouteProps } from '../models/auth';
import { TripRouteProps } from '../models/trip';
import Login from '../pages/Login/Login';
import Register from '../pages/Register/Register';
import Trip from '../pages/Trip/Trip';
import Trips from '../pages/Trips/Trips';
import User from '../pages/User/User';
import Users from '../pages/Users/Users';

export interface RoutesProps {}

const Routes: React.FC<RoutesProps> = () => {
  const routes = useRoutes();

  const { canCrudUsers, currentUserQuery } = useCanCrudUsers();

  return (
    <Switch>
      {!currentUserQuery.data && (
        <Route exact path={routes.register.paths[0]} component={Register} />
      )}
      {!currentUserQuery.data && <Route component={Login} />}
      {currentUserQuery.data && (
        <Route
          path={routes.trips.paths[0]}
          exact
          render={(props) => <Trips {...props} user={currentUserQuery.data} />}
        />
      )}
      {currentUserQuery.data && (
        <Route
          path={routes.trips.paths[1]}
          exact
          render={(props) => <Trips {...props} user={currentUserQuery.data} />}
        />
      )}
      {currentUserQuery.data && (
        <Route
          path={routes.trip.paths[1]}
          exact
          render={(props) => (
            <Trip
              {...(props as TripRouteProps)}
              user={currentUserQuery.data}
              canCrudUsers={canCrudUsers}
              routes={routes}
            />
          )}
        />
      )}
      {canCrudUsers && (
        <Route
          path={routes.users.paths[0]}
          exact
          render={(props) => <Users {...props} routes={routes} />}
        />
      )}
      {canCrudUsers && (
        <Route
          path={routes.user.paths[1]}
          exact
          render={(props) => (
            <User {...(props as UserRouteProps)} routes={routes} />
          )}
        />
      )}
      <Route component={NotFound} />
    </Switch>
  );
};

export default Routes;
