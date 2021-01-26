import { range } from 'ramda';
import React from 'react';
import { InfiniteLoader, InfiniteLoaderProps } from 'react-virtualized';
import { ApiError, Result } from '../models/models';
import { processError, updateItems } from '../utils/utils';

export interface FetchParams {
  startIndex: number;
  limit: number;
  timestamp: string;
}

export interface InfiniteLoaderParams<A> {
  fetch: (params: FetchParams) => Promise<A[]>;
  itemsCount: number;
  setItemsCount: (count: number) => void;
  items: Array<Result<A>>;
  setItems: React.Dispatch<React.SetStateAction<Array<Result<A>>>>;
}

const useInfiniteLoader = <A>({
  fetch,
  itemsCount,
  setItemsCount,
  items,
  setItems,
}: InfiniteLoaderParams<A>) => {
  const ref = React.useRef<InfiniteLoader | null>(null);

  const loadMoreRows: InfiniteLoaderProps['loadMoreRows'] = React.useCallback(
    ({ startIndex, stopIndex }) => {
      const exclusiveStopIndex = stopIndex + 1;
      const limit = exclusiveStopIndex - startIndex;

      const itemsRange = range(startIndex, exclusiveStopIndex);

      setItems((currentItems) =>
        currentItems.concat(itemsRange.map(() => ({ loading: true }))),
      );

      const fetchParams: FetchParams = {
        startIndex,
        limit: exclusiveStopIndex,
        timestamp: Date.now().toString(),
      };

      const fetchItems = () =>
        fetch(fetchParams)
          .then((newItems) => {
            setItems((currentItems) => {
              if (newItems.length < limit) {
                if (newItems.length) {
                  const updatedItems = updateItems({
                    startIndex,
                    limit,
                    newItems,
                    currentItems,
                  });
                  const filteredItems = updatedItems.filter(
                    (item) => !(item && ('loading' in item || 'error' in item)),
                  );
                  setItemsCount(filteredItems.length);
                  return filteredItems;
                } else {
                  const filteredItems = currentItems.filter(
                    (_, i) => i < startIndex,
                  );
                  setItemsCount(filteredItems.length);
                  return filteredItems;
                }
              } else {
                const updatedItems = updateItems({
                  startIndex,
                  limit,
                  newItems,
                  currentItems,
                });
                return updatedItems;
              }
            });
          })
          .catch((apiError: ApiError) => {
            return processError(apiError).then((error) => {
              const newItems = itemsRange.map(() => ({
                error,
                retry: fetchItems,
              }));
              setItems((currentItems) => {
                const itemsToUpdate = currentItems.slice();
                itemsToUpdate.splice(startIndex, limit, ...newItems);
                if (newItems.length < limit) {
                  setItemsCount(itemsToUpdate.length);
                }
                return itemsToUpdate;
              });
            });
          });

      return fetchItems();
    },
    [fetch, setItems, setItemsCount],
  );

  const isRowLoaded: InfiniteLoaderProps['isRowLoaded'] = React.useCallback(
    ({ index }) => {
      const row = items[index];
      return !!row;
    },
    [items],
  );

  return React.useMemo(
    () => ({ ref, items, rowCount: itemsCount, loadMoreRows, isRowLoaded }),
    [items, itemsCount, loadMoreRows, isRowLoaded],
  );
};

export default useInfiniteLoader;
