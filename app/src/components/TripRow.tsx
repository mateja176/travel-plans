import { Button, Flex, Skeleton, Text, Tooltip } from '@chakra-ui/react';
import React from 'react';
import { Trip } from '../generated/api';
import { Result } from '../models/models';
import { ITripStatus } from '../models/trip';
import { tripRoute } from '../utils/routes';
import { getStatusDays, getTripStatus } from '../utils/trip';
import { getErrorMessage, setMatch } from '../utils/utils';
import Link from './Link';
import TripStatus from './Row/TripStatus';
import { rowWrapperProps } from './Row/utils';

const formatDays = (days: number) =>
  days === 1
    ? ['1 day', '1 day']
    : days === 0
    ? ['> 1 day', 'Less than a day']
    : [`${days} days`, `${days} days`];

export interface TripRowProps {
  style: React.CSSProperties;
  trip: Result<Trip> | undefined;
}

const TripRow: React.FC<TripRowProps> = (props) => {
  return (
    <Flex flexDirection="column" style={props.style}>
      {!props.trip || 'loading' in props.trip ? (
        <Flex {...rowWrapperProps}>
          <Skeleton height="100%" width="100%" />
        </Flex>
      ) : 'error' in props.trip ? (
        <Flex {...rowWrapperProps}>
          <Flex px={6} justifyContent="space-between" alignItems="center">
            <Text>{getErrorMessage(props.trip.error)}</Text>
            <Button onClick={props.trip.retry}>Retry</Button>
          </Flex>
        </Flex>
      ) : (
        <Link
          to={{
            pathname: setMatch(props.trip.id, tripRoute.paths[1]),
            state: { trip: props.trip },
          }}
        >
          <Flex {...rowWrapperProps}>
            {(() => {
              const status: ITripStatus = getTripStatus(props.trip);

              const statusDays = getStatusDays(status, props.trip);

              return (
                <Flex alignItems="center" px={6}>
                  <TripStatus status={status} />
                  <Text ml={5}>{props.trip.destination}</Text>
                  <Flex flexGrow={1} justifyContent="flex-end">
                    {(() => {
                      switch (statusDays[0]) {
                        case 'ended': {
                          const [days, label] = formatDays(statusDays[1]);
                          return (
                            <>
                              <Text color="gray.500" width="60px">
                                Before:
                              </Text>
                              &nbsp;
                              <Tooltip label={label}>
                                <Text
                                  width="70px"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  textAlign="right"
                                >
                                  {days}
                                </Text>
                              </Tooltip>
                            </>
                          );
                        }
                        default: {
                          const [days, label] = formatDays(statusDays[1]);
                          return (
                            <>
                              <Text color="gray.500" width="60px">
                                {status === 'active' ? 'Ends in:' : 'In:'}
                              </Text>
                              &nbsp;
                              <Tooltip label={label}>
                                <Text
                                  width="70px"
                                  overflow="hidden"
                                  textOverflow="ellipsis"
                                  whiteSpace="nowrap"
                                  textAlign="right"
                                >
                                  {days}
                                </Text>
                              </Tooltip>
                            </>
                          );
                        }
                      }
                    })()}
                  </Flex>
                </Flex>
              );
            })()}
          </Flex>
        </Link>
      )}
    </Flex>
  );
};

export default TripRow;
