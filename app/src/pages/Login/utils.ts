import { LinkProps } from 'react-router-dom';
import * as yup from 'yup';
import { LoginRequest } from '../../generated/api';
import { WithPath } from '../../models/models';
import { loginRoute, registerRoute } from '../../utils/routes';
import { emailSchema, passwordSchema } from '../../utils/schemas';

export const toRegister: LinkProps<WithPath>['to'] = {
  pathname: registerRoute.paths[0],
  state: {
    path: loginRoute.paths[0],
  },
};

export const loginValues: LoginRequest = {
  identifier: '',
  password: '',
};

export const loginSchema = yup.object().required().shape({
  identifier: emailSchema,
  password: passwordSchema,
});
