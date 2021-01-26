import { Link as ChakraLink } from '@chakra-ui/react';
import React from 'react';
import {
  Link as RouterLink,
  LinkProps as RouterLinkProps,
} from 'react-router-dom';

export interface LinkProps extends RouterLinkProps {}

const Link: React.FC<LinkProps> = (props) => {
  return <ChakraLink {...props} as={RouterLink}></ChakraLink>;
};

export default Link;
