import { Button, Flex, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import {
  UsersPermissionsRole,
  UsersPermissionsUser,
} from '../../generated/api';
import { Result } from '../../models/models';
import { Routes } from '../../utils/routes';
import { getErrorMessage, setMatch } from '../../utils/utils';
import Link from '../Link';
import { rowWrapperProps } from './utils';

export interface UserRowProps {
  style: React.CSSProperties;
  user: Result<UsersPermissionsUser> | undefined;
  routes: Routes;
}

const UserRow: React.FC<UserRowProps> = (props) => {
  return (
    <Flex flexDirection="column" style={props.style}>
      {!props.user || 'loading' in props.user ? (
        <Flex {...rowWrapperProps}>
          <Skeleton height="100%" width="100%" />
        </Flex>
      ) : 'error' in props.user ? (
        <Flex {...rowWrapperProps}>
          <Flex px={6} justifyContent="space-between" alignItems="center">
            <Text>{getErrorMessage(props.user.error)}</Text>
            <Button onClick={props.user.retry}>Retry</Button>
          </Flex>
        </Flex>
      ) : (
        (() => {
          const role = props.user.role as UsersPermissionsRole | undefined;

          return (
            <Link
              to={{
                pathname: setMatch(props.user.id, props.routes.user.paths[1]),
                state: { user: props.user },
              }}
            >
              <Flex {...rowWrapperProps}>
                <Flex alignItems="center" px={6} justifyContent="space-between">
                  <Text ml={5}>{props.user.username}</Text>
                  <Tooltip label={role?.description}>
                    <Text>{role?.name}</Text>
                  </Tooltip>
                </Flex>
              </Flex>
            </Link>
          );
        })()
      )}
    </Flex>
  );
};

export default UserRow;
