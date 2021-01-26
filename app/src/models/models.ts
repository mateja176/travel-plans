import { newKey } from '../config/config';
import { Trip, UsersPermissionsUser } from '../generated/api';
import { Path } from '../utils/routes';

export interface LocalStorageItem<A> {
  item: A | null;
  setItem: (item: A) => void;
  removeItem: () => void;
}

export type Timeout = ReturnType<typeof setTimeout>;

export interface Entity {
  id: string;
}

export interface WithId {
  id: typeof newKey | string;
}

export interface WithUser {
  user?: UsersPermissionsUser;
}

export interface WithTrip {
  trip?: Trip;
}

export interface WithPath {
  path?: Path;
}

export interface ServerError {
  statusCode: number;
  error: string;
  message: Array<{ messages: Array<Message> }>;
}
export interface ServerError1 extends Error {
  status: number;
}

export type ServerError2 = { json: () => Promise<ServerError | ServerError1> };

export type ApiError = ServerError | ServerError1 | ServerError2 | Error;
export type SyncApiError = ServerError | ServerError1 | Error;

export interface Message {
  id: string;
  message: string;
}

export type Result<Data> =
  | null
  | { loading: true }
  | Data
  | { error: SyncApiError; retry: () => void };
