import { RouteComponentProps, StaticContext } from 'react-router';
import { WithId, WithTrip } from './models';

export const tripStatuses = ['upcoming', 'active', 'ended'] as const;
export type TripStatuses = typeof tripStatuses;
export type ITripStatus = TripStatuses[number];

export type TripRouteProps = RouteComponentProps<
  WithId,
  StaticContext,
  WithTrip | undefined
>;
