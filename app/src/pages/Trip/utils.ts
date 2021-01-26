import dayjs from 'dayjs';
import * as yup from 'yup';
import { Trip } from '../../generated/api';

export interface TripValues
  extends Pick<Trip, 'destination' | 'startDate' | 'endDate' | 'comment'> {}

export const getInitialTripValues: () => {
  values: TripValues;
  tomorrow: Date;
} = () => {
  const tomorrowDayjs = dayjs().add(1, 'day');
  const tomorrow = tomorrowDayjs.toDate();

  return {
    values: {
      destination: '',
      startDate: tomorrow,
      endDate: tomorrowDayjs.add(1, 'day').toDate(),
      comment: '',
    },
    tomorrow,
  };
};

export const tripSchema = yup
  .object()
  .required()
  .shape({
    destination: yup.string().required('Please specify a destination.'),
    startDate: yup
      .date()
      .required('Please specify a start date.')
      .min(new Date(), 'Start date cannot be in the past.'),
    endDate: yup
      .date()
      .required('Please specify a end date.')
      .min(
        yup.ref('startDate'),
        'End date must be greater than the start date.',
      ),
    comment: yup.string(),
  });
