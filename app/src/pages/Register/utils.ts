import { LinkProps } from 'react-router-dom';
import { WithPath } from '../../models/models';
import { loginRoute, registerRoute } from '../../utils/routes';

export const toRegister: LinkProps<WithPath>['to'] = {
  pathname: registerRoute.paths[0],
  state: {
    path: loginRoute.paths[0],
  },
};
