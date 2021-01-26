import { Box, Heading, Text } from '@chakra-ui/react';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import { startCase } from 'lodash';
import { omit } from 'ramda';
import React from 'react';
import { Trip } from '../generated/api';

dayjs.extend(advancedFormat);

export interface PrintProps {
  trips: Trip[];
}

const columnLabels = {
  destination: 'Destination',
  startDate: 'Start Date',
  endDate: 'End Date',
  comment: 'Comment',
};

const border = '1px solid #000';
const cellStyle: React.CSSProperties = {
  border,
  color: '#000',
  padding: 10,
  whiteSpace: 'nowrap',
};
const tdStyle: React.CSSProperties = {
  ...cellStyle,
  border,
  textAlign: 'center',
};
const commentStyle: React.CSSProperties = omit(['whiteSpace'], tdStyle);
const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  border,
};

const formatDate = (date: Date): string => dayjs(date).format('Do MMM YYYY');

export default class Print extends React.PureComponent<PrintProps> {
  render() {
    const trips = this.props.trips.map(({ id, user, ...trip }) => trip);
    return (
      <Box color="#000" px={6}>
        <Heading textAlign="center">Your Trips</Heading>
        <Heading mb={6} textAlign="center" size="lg">
          For The Next Month
        </Heading>
        {trips[0] ? (
          <table style={tableStyle}>
            <thead>
              <tr>
                {Object.values(columnLabels).map((label) => (
                  <th key={label} style={cellStyle}>
                    {startCase(label)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, i) => (
                <tr key={this.props.trips[i]?.id}>
                  <td style={tdStyle}>{trip.destination}</td>
                  <td style={tdStyle}>{formatDate(trip.startDate)}</td>
                  <td style={tdStyle}>{formatDate(trip.endDate)}</td>
                  <td style={commentStyle}>{trip.comment ?? 'None'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <Text>You don't have any trips for the upcoming month.</Text>
        )}
      </Box>
    );
  }
}
