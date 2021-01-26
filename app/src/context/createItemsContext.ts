import React from 'react';
import { Entity, Result } from '../models/models';

export interface IItemsContext<A extends Entity> {
  itemsCount: number;
  setItemsCount: (count: number) => void;
  items: Array<Result<A>>;
  setItems: React.Dispatch<React.SetStateAction<Array<Result<A>>>>;
  setItem: (item: A) => void;
  insertItem: (item: A) => void;
  removeItem: (id: A['id']) => void;
  clear: () => void;
}

export const initialItemsCount = 1000;

const createItemsContext = <A extends Entity>() =>
  React.createContext<IItemsContext<A>>({
    itemsCount: initialItemsCount,
    setItemsCount: () => {},
    items: [],
    setItems: () => {},
    setItem: () => {},
    insertItem: () => {},
    removeItem: () => {},
    clear: () => {},
  });

export default createItemsContext;
