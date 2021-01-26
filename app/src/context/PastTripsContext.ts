import { Trip } from '../generated/api';
import createItemsContext from './createItemsContext';

const PastTripsContext = createItemsContext<Trip>();

export default PastTripsContext;
