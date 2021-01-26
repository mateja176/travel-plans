import { Box, Text } from '@chakra-ui/react';
import React from 'react';
import TripsIcon from '../../../components/TripsIcon';

const NoPastTrips = () => (
  <Box>
    <Text>
      <TripsIcon />
      &nbsp;At the moment, you don't have any past trips.
    </Text>
  </Box>
);

export default NoPastTrips;
