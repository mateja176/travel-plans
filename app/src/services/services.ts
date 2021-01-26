import { apiTokenKey } from '../config/config';

export const getApiToken = () => {
  const token = localStorage.getItem(apiTokenKey);
  return token && JSON.parse(token);
};
