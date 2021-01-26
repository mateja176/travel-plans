import { ApiError, SyncApiError } from '../models/models';

export const setMatch = (match: string, path: string) => {
  return path.replace(/(?<=\/):\w+$/, match);
};

export const getErrorStatusCode = (error: ApiError) => {
  return 'status' in error
    ? error.status
    : 'statusCode' in error
    ? error.statusCode
    : 0;
};
export const processError = async (error: ApiError): Promise<SyncApiError> => {
  return 'json' in error ? await error.json() : error;
};
export const getErrorMessage = (error: SyncApiError) => {
  return typeof error.message === 'string'
    ? error.message
    : error.message[0]?.messages[0]?.message;
};
export const getErrorMessageWithFallback = (
  fallback: string,
  error: ApiError,
) => {
  return 'json' in error ? fallback : getErrorMessage(error);
};

export const updateItems = <A>({
  currentItems,
  limit,
  newItems,
  startIndex,
}: {
  startIndex: number;
  limit: number;
  newItems: A[];
  currentItems: A[];
}) => {
  const itemsToUpdate = currentItems.slice();
  itemsToUpdate.splice(startIndex, limit, ...newItems);

  return itemsToUpdate;
};
