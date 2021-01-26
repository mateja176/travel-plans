import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import TripsIcon from '../../../components/TripsIcon';

const NoTrips = () => (
  <Box>
    <Text>
      <TripsIcon />
      &nbsp;At the moment, you don't have active or upcoming trips.
    </Text>
  </Box>
);

export default NoTrips;
