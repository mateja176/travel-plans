import { dec, inc } from 'ramda';
import React from 'react';
import AuthContext from '../../context/AuthContext';
import {
  IItemsContext,
  initialItemsCount,
} from '../../context/createItemsContext';
import { UsersPermissionsUser } from '../../generated/api';

type IAuthContext = IItemsContext<UsersPermissionsUser>;

export interface AuthProps {}

const Auth: React.FC<AuthProps> = (props) => {
  const [usersCount, setUsersCount] = React.useState(initialItemsCount);
  const [users, setUsers] = React.useState<IAuthContext['items']>([]);
  const setUser: IAuthContext['setItem'] = React.useCallback((newItem) => {
    setUsers((items) =>
      items.map((item) =>
        item && 'id' in item && item.id === newItem.id ? newItem : item,
      ),
    );
  }, []);
  const insertUser: IAuthContext['insertItem'] = React.useCallback(
    (newItem) => {
      setUsers((items) => items.concat(newItem));

      setUsersCount(inc);
    },
    [],
  );

  const removeUser: IAuthContext['removeItem'] = React.useCallback((id) => {
    setUsers((items) =>
      items.filter((item) => !item || !('id' in item) || item.id !== id),
    );

    setUsersCount(dec);
  }, []);

  const clear = React.useCallback(() => {
    setUsersCount(initialItemsCount);

    setUsers([]);
  }, []);

  return (
    <AuthContext.Provider
      value={React.useMemo(
        () => ({
          itemsCount: usersCount,
          setItemsCount: setUsersCount,
          items: users,
          setItems: setUsers,
          setItem: setUser,
          insertItem: insertUser,
          removeItem: removeUser,
          clear,
        }),
        [users, setUser, insertUser, removeUser, usersCount, clear],
      )}
    >
      {props.children}
    </AuthContext.Provider>
  );
};

export default Auth;
