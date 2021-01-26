import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React from 'react';
import { useMutation } from 'react-query';
import { LinkProps, RouteComponentProps } from 'react-router-dom';
import Card from '../../components/Card';
import Link from '../../components/Link';
import { AuthLocalPostRequest, AuthResponse } from '../../generated/api';
import { useApiToken } from '../../hooks/auth';
import { ApiError, WithPath } from '../../models/models';
import { userApi } from '../../services/api';
import {
  loginRoute,
  registerRoute,
  tripRoute,
  tripsRoute,
} from '../../utils/routes';
import { getErrorMessage, processError } from '../../utils/utils';
import { loginSchema, loginValues } from './utils';

const toRegister: LinkProps<WithPath>['to'] = {
  pathname: registerRoute.paths[0],
  state: {
    path: loginRoute.paths[0],
  },
};

export interface LoginProps extends RouteComponentProps {}

const Login: React.FC<LoginProps> = (props) => {
  const toast = useToast();

  const token = useApiToken();

  const loginMutation = useMutation<
    AuthResponse,
    ApiError,
    AuthLocalPostRequest
  >(userApi.authLocalPost.bind(userApi), {
    onSuccess: ({ jwt, user: { username } }) => {
      toast({
        title: 'Logged in',
        description: `Welcome back ${username}!`,
        status: 'success',
        isClosable: true,
      });

      token.setItem(jwt);

      if (props.location.pathname === loginRoute.paths[0]) {
        props.history.replace(tripsRoute.paths[0]);
      }
    },
    onError: async (apiError) => {
      const error = await processError(apiError);
      toast({
        title: 'Failed to log in',
        description: getErrorMessage(error),
        status: 'error',
        isClosable: true,
      });
    },
  });

  const loginForm = useFormik({
    validateOnMount: true,
    initialValues: loginValues,
    validationSchema: loginSchema,
    onSubmit: (values) => {
      return loginMutation.mutateAsync({ loginRequest: values });
    },
  });

  const hasIdentifierError = React.useMemo(
    () => !!(loginForm.touched.identifier && loginForm.errors.identifier),
    [loginForm],
  );
  const hasPasswordError = React.useMemo(
    () => !!(loginForm.touched.password && loginForm.errors.password),
    [loginForm],
  );

  return (
    <Card>
      <Heading textAlign="center">Login</Heading>

      <form onSubmit={loginForm.handleSubmit}>
        <FormControl mt={8} isInvalid={hasIdentifierError}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@smith.com"
            {...loginForm.getFieldProps('identifier')}
          />
          <FormErrorMessage>{loginForm.errors.identifier}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isInvalid={hasPasswordError}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            {...loginForm.getFieldProps('password')}
          />
          <FormErrorMessage>{loginForm.errors.password}</FormErrorMessage>
        </FormControl>

        <Button
          colorScheme="blue"
          mt={8}
          type="submit"
          disabled={!loginForm.isValid}
          isLoading={loginForm.isSubmitting}
          loadingText="Logging in"
          leftIcon={<tripRoute.Icon />}
        >
          Log in
        </Button>
      </form>

      <Flex mt={10} flexDirection="column" alignItems="center">
        <Text mb={2} color="gray.500">
          If you don't have an account you can register below.
        </Text>
        <Link to={toRegister}>Register</Link>
      </Flex>
    </Card>
  );
};

export default Login;
