import { Box, Flex, Heading } from '@chakra-ui/react';
import React from 'react';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import UserRow from '../../components/Row/UserRow';
import { rowHeight } from '../../components/Row/utils';
import AuthContext from '../../context/AuthContext';
import useInfiniteLoader from '../../hooks/useInfiniteLoader';
import { userApi } from '../../services/api';
import { Routes } from '../../utils/routes';
import NoUsers from './components/NoUsers';

export interface UsersProps {
  routes: Routes;
}

const Users: React.FC<UsersProps> = (props) => {
  const usersContext = React.useContext(AuthContext);

  const usersLoader = useInfiniteLoader(
    React.useMemo(
      () => ({
        fetch: ({ startIndex, limit }) =>
          userApi.usersGet({
            start: startIndex,
            limit,
          }),
        itemsCount: usersContext.itemsCount,
        setItemsCount: usersContext.setItemsCount,
        items: usersContext.items,
        setItems: usersContext.setItems,
      }),
      [
        usersContext.itemsCount,
        usersContext.setItemsCount,
        usersContext.items,
        usersContext.setItems,
      ],
    ),
  );

  const userRowCount = usersLoader.rowCount;

  return (
    <Flex height="100%" flexDirection="column">
      <Flex mt={6} justifyContent="space-between">
        <Heading>Users</Heading>
      </Flex>
      <Box mt={8} flexGrow={1}>
        <AutoSizer>
          {({ width, height }) => (
            <InfiniteLoader
              ref={usersLoader.ref}
              loadMoreRows={usersLoader.loadMoreRows}
              isRowLoaded={usersLoader.isRowLoaded}
              rowCount={userRowCount}
            >
              {({ onRowsRendered, registerChild }) => (
                <List
                  rowCount={userRowCount}
                  ref={registerChild}
                  onRowsRendered={onRowsRendered}
                  width={width}
                  height={height}
                  rowHeight={rowHeight}
                  noRowsRenderer={NoUsers}
                  rowRenderer={({ index, style }) => {
                    const items = usersLoader.items;
                    const user = items[index];
                    return (
                      <UserRow
                        key={user && 'id' in user ? user.id : index}
                        style={style}
                        user={user}
                        routes={props.routes}
                      />
                    );
                  }}
                />
              )}
            </InfiniteLoader>
          )}
        </AutoSizer>
      </Box>
    </Flex>
  );
};

export default Users;
