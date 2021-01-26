import { List, ListIcon, ListItem, Text, useTheme } from '@chakra-ui/react';
import React from 'react';
import { useLocation } from 'react-router-dom';
import Link from '../../../components/Link';
import { useNavigationRoutes } from '../../../hooks/auth';

export interface MenuProps {
  onItemClick: React.MouseEventHandler<HTMLLIElement>;
}

const Navigation: React.FC<MenuProps> = (props) => {
  const location = useLocation();

  const theme = useTheme();

  const navigationRoutes = useNavigationRoutes();

  return (
    <List display="flex" flexDirection="column" spacing={4}>
      {Object.values(navigationRoutes).map(({ Icon, label, paths }) => {
        const color = (paths as ReadonlyArray<string>).includes(
          location.pathname,
        )
          ? theme.colors.blue[500]
          : theme.colors.white;

        return (
          <ListItem
            display="flex"
            alignItems="center"
            key={paths[0]}
            to={paths[0]}
            onClick={props.onItemClick}
            as={Link}
          >
            <ListIcon as={() => <Icon style={{ color }} />} />
            <Text color={color} ml={3}>
              {label}
            </Text>
          </ListItem>
        );
      })}
    </List>
  );
};

export default Navigation;
