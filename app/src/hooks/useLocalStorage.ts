import React from 'react';
import { v4 } from 'uuid';
import { LocalStorageItem } from '../models/models';

type Observer = {
  id: string;
  key: string;
  observe: (item: string | null) => void;
};
const observers: Array<Observer> = [];

const storage: Storage & {
  subscribe: (observer: Omit<Observer, 'id'>) => Observer['id'];
  unsubscribe: (id: Observer['id']) => void;
} = {
  getItem: localStorage.getItem.bind(localStorage),
  get length() {
    return localStorage.length;
  },
  key: localStorage.key.bind(localStorage),
  subscribe: (observer) => {
    const id = v4();

    observers.push({ ...observer, id });

    return id;
  },
  unsubscribe: (id) => {
    const observerIndex = observers.findIndex((observer) => observer.id === id);
    observers.splice(observerIndex, 1);
  },
  setItem: (key, value) => {
    localStorage.setItem(key, value);

    observers
      .filter((observer) => observer.key === key)
      .forEach((observer) => observer.observe(value));
  },
  removeItem: (key) => {
    localStorage.removeItem(key);

    observers
      .filter((observer) => observer.key === key)
      .forEach((observer) => observer.observe(null));
  },
  clear: () => {
    localStorage.clear();

    observers.forEach((observer) => observer.observe(null));
  },
};

export const useLocalStorageItem = <A>(key: string): LocalStorageItem<A> => {
  const getItem = React.useCallback(() => {
    const localStorageItem = storage.getItem(key);

    return localStorageItem && JSON.parse(localStorageItem);
  }, [key]);

  const [item, setItem] = React.useState<A | null>(getItem);
  React.useEffect(() => {
    const id = storage.subscribe({
      key,
      observe: (item) => {
        setItem(item && JSON.parse(item));
      },
    });
    return () => {
      storage.unsubscribe(id);
    };
  }, [key]);

  const setLocalStorageItem = React.useCallback(
    (item: A) => {
      storage.setItem(key, JSON.stringify(item));
    },
    [key],
  );

  const removeItem = React.useCallback(() => {
    storage.removeItem(key);

    setItem(null);
  }, [key]);

  return React.useMemo(
    () => ({
      item,
      setItem: setLocalStorageItem,
      removeItem,
    }),
    [item, removeItem, setLocalStorageItem],
  );
};
