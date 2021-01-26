import { Trip } from '../generated/api';
import createItemsContext from './createItemsContext';

const TripsContext = createItemsContext<Trip>();

export default TripsContext;
