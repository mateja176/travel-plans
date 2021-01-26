import { dec, inc } from 'ramda';
import React from 'react';
import {
  IItemsContext,
  initialItemsCount,
} from '../../context/createItemsContext';
import PastTripsContext from '../../context/PastTripsContext';
import TripsContext from '../../context/TripsContext';
import { Trip } from '../../generated/api';
import { Result } from '../../models/models';
import { sortTrips } from '../../utils/trip';

type ITripsContext = IItemsContext<Trip>;

export interface TripsProviderProps {}

const TripsProvider: React.FC<TripsProviderProps> = (props) => {
  const [tripsCount, setTripsCount] = React.useState(initialItemsCount);
  const [trips, setTrips] = React.useState<ITripsContext['items']>([]);
  const setTrip: ITripsContext['setItem'] = React.useCallback((newItem) => {
    setTrips((items) =>
      items
        .map((item) =>
          item && 'id' in item && item.id === newItem.id ? newItem : item,
        )
        .sort(sortTrips),
    );
  }, []);
  const insertTrip: ITripsContext['insertItem'] = React.useCallback(
    (newItem) => {
      setTrips((items) => items.concat(newItem).sort(sortTrips));

      setTripsCount(inc);
    },
    [],
  );
  const removeTrip: ITripsContext['removeItem'] = React.useCallback((id) => {
    setTrips((items) =>
      items.filter((item) => !item || !('id' in item) || item.id !== id),
    );

    setTripsCount(dec);
  }, []);
  const clearTrips = React.useCallback(() => {
    setTripsCount(initialItemsCount);

    setTrips([]);
  }, []);

  const [pastTripsCount, setPastTripsCount] = React.useState(initialItemsCount);
  const [pastTrips, setPastTrips] = React.useState<Array<Result<Trip>>>([]);
  const setPastTrip: ITripsContext['setItem'] = React.useCallback((newItem) => {
    setPastTrips((items) =>
      items
        .map((item) =>
          item && 'id' in item && item.id === newItem.id ? newItem : item,
        )
        .sort(sortTrips),
    );
  }, []);
  const insertPastTrip: ITripsContext['insertItem'] = React.useCallback(
    (newItem) => {
      setPastTrips((items) => items.concat(newItem).sort(sortTrips));

      setPastTripsCount(inc);
    },
    [],
  );
  const removePastTrip: ITripsContext['removeItem'] = React.useCallback(
    (id) => {
      setPastTrips((items) =>
        items.filter((item) => !item || !('id' in item) || item.id !== id),
      );

      setPastTripsCount(dec);
    },
    [],
  );
  const clearPastTrips = React.useCallback(() => {
    setPastTripsCount(initialItemsCount);

    setPastTrips([]);
  }, []);

  return (
    <TripsContext.Provider
      value={React.useMemo(
        () => ({
          itemsCount: tripsCount,
          setItemsCount: setTripsCount,
          items: trips,
          setItems: setTrips,
          setItem: setTrip,
          insertItem: insertTrip,
          removeItem: removeTrip,
          clear: clearTrips,
        }),
        [trips, setTrip, insertTrip, removeTrip, tripsCount, clearTrips],
      )}
    >
      <PastTripsContext.Provider
        value={React.useMemo(
          () => ({
            itemsCount: pastTripsCount,
            setItemsCount: setPastTripsCount,
            items: pastTrips,
            setItems: setPastTrips,
            setItem: setPastTrip,
            insertItem: insertPastTrip,
            removeItem: removePastTrip,
            clear: clearPastTrips,
          }),
          [
            pastTrips,
            setPastTrip,
            insertPastTrip,
            removePastTrip,
            pastTripsCount,
            clearPastTrips,
          ],
        )}
      >
        {props.children}
      </PastTripsContext.Provider>
    </TripsContext.Provider>
  );
};

export default TripsProvider;
