import { useBoolean } from '@chakra-ui/react';
import React from 'react';
import { useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import { apiTokenKey } from '../config/config';
import { UsersPermissionsRole, UsersPermissionsUser } from '../generated/api';
import { ApiError } from '../models/models';
import { userApi } from '../services/api';
import { getCanCrudUsers } from '../utils/auth';
import getRoutes, { getNavigationRoutes } from '../utils/routes';
import { getErrorStatusCode } from '../utils/utils';
import { useLocalStorageItem } from './useLocalStorage';

export const useApiToken = () => {
  return useLocalStorageItem<string>(apiTokenKey);
};

export const useIsLoggedIn = () => {
  const token = useApiToken();
  return !!token.item;
};

export const useCurrentUserQuery = () => {
  const tokenItem = useApiToken();

  const [retry, setRetry] = useBoolean();
  const history = useHistory();

  const currentUserQuery = useQuery<UsersPermissionsUser, ApiError>(
    '/users/me',
    userApi.usersMeGet.bind(userApi),
    {
      enabled: false,
      retry,
      onError: (error) => {
        if (getErrorStatusCode(error) === 401) {
          tokenItem.removeItem();
          history.replace(getRoutes(false).login.paths[0]);
        } else {
          setRetry.on();
        }
      },
    },
  );

  return { currentUserQuery, tokenItem };
};
export const useCanCrudUsers = () => {
  const { currentUserQuery } = useCurrentUserQuery();

  const canCrudUsers = React.useMemo(() => {
    return getCanCrudUsers(
      currentUserQuery.data?.role as UsersPermissionsRole | undefined,
    );
  }, [currentUserQuery]);

  return React.useMemo(() => ({ canCrudUsers, currentUserQuery }), [
    canCrudUsers,
    currentUserQuery,
  ]);
};

export const useNavigationRoutes = () => {
  const { canCrudUsers } = useCanCrudUsers();

  return getNavigationRoutes(canCrudUsers);
};
export const useRoutes = () => {
  const { canCrudUsers } = useCanCrudUsers();

  return getRoutes(canCrudUsers);
};
