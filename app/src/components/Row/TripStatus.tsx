import { Box, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { ITripStatus } from '../../models/trip';
import { tripStatusColors, tripStatusText } from '../../utils/trip';

export interface TripStatusProps {
  status: ITripStatus;
}

const TripStatus: React.FC<TripStatusProps> = (props) => {
  return (
    <Tooltip label={tripStatusText[props.status]}>
      <Box
        borderRadius="50%"
        width="10px"
        height="10px"
        bg={tripStatusColors[props.status]}
      />
    </Tooltip>
  );
};

export default TripStatus;
