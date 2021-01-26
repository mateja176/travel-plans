import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import TripsIcon from '../../../components/TripsIcon';

const NoUsers = () => (
  <Box>
    <Text>
      <TripsIcon /> There are currently no users.
    </Text>
  </Box>
);

export default NoUsers;
