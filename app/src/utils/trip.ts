import dayjs from 'dayjs';
import { Trip } from '../generated/api';
import { Result } from '../models/models';
import { ITripStatus, tripStatuses } from '../models/trip';

export const tripsAscSort = 'startDate:asc';

export const sortTrips = (a: Result<Trip>, b: Result<Trip>): number => {
  return a && 'id' in a && b && 'id' in b
    ? a.startDate.getTime() - b.startDate.getTime()
    : 0;
};

export const isTripStatus = (status: string): status is ITripStatus => {
  return tripStatuses.includes(status as ITripStatus);
};

export const tripStatusColors: Record<ITripStatus, string> = {
  active: 'yellow.500',
  ended: 'red.500',
  upcoming: 'green.500',
};
export const tripStatusText: Record<ITripStatus, string> = {
  active: 'This trip is in progress.',
  ended: 'This trip has already ended.',
  upcoming: 'This trip has not started yet.',
};

export const getTripStatus = (trip: Trip) => {
  const nowTimestamp = Date.now();
  const endTimestamp = trip.endDate.getTime();
  const startTimestamp = trip.startDate.getTime();
  return endTimestamp <= nowTimestamp
    ? 'ended'
    : startTimestamp < nowTimestamp
    ? 'active'
    : 'upcoming';
};

export type StatusTime = {
  [key in ITripStatus]: [key, number];
}[ITripStatus];

export const getStatusTime = (unit: dayjs.QUnitType | dayjs.OpUnitType) => (
  status: ITripStatus,
  trip: Trip,
): StatusTime => {
  switch (status) {
    case 'ended':
      return ['ended', dayjs().diff(trip.endDate, unit)];
    case 'active':
      return ['active', dayjs(trip.endDate).diff(dayjs(), unit)];
    default:
      return ['upcoming', dayjs(trip.startDate).diff(dayjs(), unit)];
  }
};

export const getStatusDays = getStatusTime('days');
export const getStatusMilliseconds = getStatusTime('milliseconds');
