import { UsersPermissionsUser } from '../generated/api';
import createItemsContext from './createItemsContext';

const AuthContext = createItemsContext<UsersPermissionsUser>();

export default AuthContext;
