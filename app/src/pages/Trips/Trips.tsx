import {
  Box,
  Flex,
  Heading,
  IconButton,
  Input,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import qs from 'qs';
import React from 'react';
import { MdSearch } from 'react-icons/md';
import { RouteComponentProps } from 'react-router-dom';
import { AutoSizer, InfiniteLoader, List } from 'react-virtualized';
import { rowHeight } from '../../components/Row/utils';
import TripRow from '../../components/TripRow';
import PastTripsContext from '../../context/PastTripsContext';
import TripsContext from '../../context/TripsContext';
import { Trip, UsersPermissionsUser } from '../../generated/api';
import useInfiniteLoader from '../../hooks/useInfiniteLoader';
import { Result, Timeout } from '../../models/models';
import { ITripStatus } from '../../models/trip';
import { tripApi } from '../../services/api';
import { getCanCrudTrips } from '../../utils/auth';
import { isTripStatus, tripsAscSort } from '../../utils/trip';
import NoPastTrips from './components/NoPastTrips';
import NoTrips from './components/NoTrips';
import { debounceTime } from './utils';

export interface TripsProps extends RouteComponentProps {
  user: UsersPermissionsUser;
}

const Trips: React.FC<TripsProps> = (props) => {
  const status: ITripStatus = React.useMemo(() => {
    const queryParams = qs.parse(props.location.search, {
      ignoreQueryPrefix: true,
    });

    if ('status' in queryParams) {
      if (
        typeof queryParams.status === 'string' &&
        isTripStatus(queryParams.status)
      ) {
        return queryParams.status;
      } else {
        props.history.push({ search: '' });

        return 'active';
      }
    } else {
      return 'active';
    }
  }, [props]);
  const setStatus = React.useCallback(
    (status: ITripStatus) => {
      props.history.push({ search: qs.stringify({ status }) });
    },
    [props],
  );

  const active = React.useMemo(() => status === 'active', [status]);

  const tripsContext = React.useContext(TripsContext);
  const pastTripsContext = React.useContext(PastTripsContext);

  const [searchValue, setSearchValue] = React.useState<string>('');
  const timeout = React.useRef<Timeout | null>(null);
  const [searchResults, setSearchResults] = React.useState<Result<Array<Trip>>>(
    null,
  );

  const canCrudTrips = React.useMemo(() => {
    return getCanCrudTrips(props.user);
  }, [props.user]);

  const tripsLoader = useInfiniteLoader(
    React.useMemo(
      () => ({
        fetch: ({ startIndex, limit }) =>
          tripApi.tripsGet({
            ...(canCrudTrips ? {} : { userId: props.user.id }),
            start: startIndex,
            limit,
            sort: tripsAscSort,
            endDateGt: Date.now().toString(),
          }),
        itemsCount: tripsContext.itemsCount,
        setItemsCount: tripsContext.setItemsCount,
        items: tripsContext.items,
        setItems: tripsContext.setItems,
      }),
      [
        tripsContext.itemsCount,
        tripsContext.setItemsCount,
        tripsContext.items,
        tripsContext.setItems,
        props.user.id,
        canCrudTrips,
      ],
    ),
  );
  const pastTripsLoader = useInfiniteLoader(
    React.useMemo(
      () => ({
        fetch: ({ startIndex, limit }) =>
          tripApi.tripsGet({
            ...(canCrudTrips ? {} : { userId: props.user.id }),
            start: startIndex,
            limit,
            sort: tripsAscSort,
            endDateLt: Date.now().toString(),
          }),
        itemsCount: pastTripsContext.itemsCount,
        setItemsCount: pastTripsContext.setItemsCount,
        items: pastTripsContext.items,
        setItems: pastTripsContext.setItems,
      }),
      [
        pastTripsContext.items,
        pastTripsContext.setItems,
        pastTripsContext.itemsCount,
        pastTripsContext.setItemsCount,
        props.user.id,
        canCrudTrips,
      ],
    ),
  );

  const handleSearch = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const search = e.target.value;

      setSearchValue(search);

      if (search) {
        setSearchResults({ loading: true });

        const retrySearch = (search: string) => {
          const timestamp = Date.now().toString();

          tripApi
            .tripsGet({
              limit: 10,
              sort: tripsAscSort,
              where: {
                _or: [
                  { destination_contains: search },
                  { comment_contains: search },
                ],
              },
              ...(active ? { endDateGt: timestamp } : { endDateLt: timestamp }),
            })
            .then((trips) => {
              setSearchResults(trips);
            })
            .catch((error) => {
              setSearchResults({
                error,
                retry: () => retrySearch(search),
              });
            });
        };

        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => {
            retrySearch(search);
          }, debounceTime);
        } else {
          timeout.current = setTimeout(() => {
            retrySearch(search);
          }, debounceTime);
        }
      } else {
        if (timeout.current) {
          clearTimeout(timeout.current);
          timeout.current = null;
        }
        setSearchResults(null);
      }
    },
    [active],
  );

  const searchResultsLength = React.useMemo(
    () => Array.isArray(searchResults) && searchResults.length,
    [searchResults],
  );
  const searchError = React.useMemo(() => {
    return (
      !!searchResults &&
      (('error' in searchResults && searchResults.error) ||
        (searchResultsLength === 0 && 'No matching items.'))
    );
  }, [searchResults, searchResultsLength]);

  const tripRowCount = React.useMemo(() => {
    return searchResultsLength || tripsLoader.rowCount;
  }, [searchResultsLength, tripsLoader.rowCount]);
  const pastTripRowCount = React.useMemo(() => {
    return searchResultsLength || pastTripsLoader.rowCount;
  }, [searchResultsLength, pastTripsLoader.rowCount]);

  return (
    <Flex height="100%" flexDirection="column">
      <Flex mt={6} justifyContent="space-between">
        <Heading>Trips</Heading>
        <Box>
          <Flex>
            <Input
              type="text"
              id="search"
              placeholder="Tokyo"
              value={searchValue}
              onChange={handleSearch}
              borderRightRadius={0}
            />
            <IconButton
              borderLeftRadius={0}
              borderWidth={1}
              borderLeftWidth={0}
              icon={<MdSearch />}
              isLoading={!!searchResults && 'loading' in searchResults}
              aria-label="Search"
            />
          </Flex>
          <Text
            mt={2}
            color="red.500"
            visibility={searchError ? 'visible' : 'hidden'}
          >
            {searchError || 'Placeholder'}
          </Text>
        </Box>
      </Flex>

      <Tabs
        isFitted
        flexGrow={1}
        mt={8}
        display="flex"
        flexDirection="column"
        index={active ? 0 : 1}
      >
        <TabList>
          <Tab
            onClick={() => {
              setStatus('active');
              timeout.current = null;
              setSearchValue('');
              setSearchResults(null);
            }}
          >
            Active
          </Tab>
          <Tab
            onClick={() => {
              setStatus('ended');
              timeout.current = null;
              setSearchValue('');
              setSearchResults(null);
            }}
          >
            Ended
          </Tab>
        </TabList>

        <TabPanels flexGrow={1}>
          <TabPanel height="100%">
            <AutoSizer>
              {({ width, height }) => (
                <InfiniteLoader
                  ref={tripsLoader.ref}
                  loadMoreRows={tripsLoader.loadMoreRows}
                  isRowLoaded={tripsLoader.isRowLoaded}
                  rowCount={tripRowCount}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                      rowCount={tripRowCount}
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      width={width}
                      height={height}
                      rowHeight={rowHeight}
                      noRowsRenderer={NoTrips}
                      rowRenderer={({ index, style }) => {
                        const items =
                          Array.isArray(searchResults) && searchResults.length
                            ? searchResults
                            : tripsLoader.items;
                        const trip = items[index];
                        return (
                          <TripRow
                            key={trip && 'id' in trip ? trip.id : index}
                            style={style}
                            trip={trip}
                          />
                        );
                      }}
                    />
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </TabPanel>
          <TabPanel height="100%">
            <AutoSizer>
              {({ width, height }) => (
                <InfiniteLoader
                  ref={pastTripsLoader.ref}
                  loadMoreRows={pastTripsLoader.loadMoreRows}
                  isRowLoaded={pastTripsLoader.isRowLoaded}
                  rowCount={pastTripRowCount}
                >
                  {({ onRowsRendered, registerChild }) => (
                    <List
                      rowCount={pastTripRowCount}
                      ref={registerChild}
                      onRowsRendered={onRowsRendered}
                      width={width}
                      height={height}
                      rowHeight={rowHeight}
                      noRowsRenderer={NoPastTrips}
                      rowRenderer={({ index, style }) => {
                        const items =
                          Array.isArray(searchResults) && searchResults.length
                            ? searchResults
                            : pastTripsLoader.items;
                        const trip = items[index];
                        return (
                          <TripRow
                            key={trip && 'id' in trip ? trip.id : index}
                            style={style}
                            trip={trip}
                          />
                        );
                      }}
                    />
                  )}
                </InfiniteLoader>
              )}
            </AutoSizer>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Flex>
  );
};

export default Trips;
