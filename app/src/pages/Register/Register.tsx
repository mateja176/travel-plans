import {
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  Input,
  Link as ChakraLink,
  Text,
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React from 'react';
import { useMutation } from 'react-query';
import { RouteComponentProps, useHistory } from 'react-router-dom';
import Card from '../../components/Card';
import Link from '../../components/Link';
import {
  AuthLocalRegisterPostRequest,
  AuthResponse,
} from '../../generated/api';
import { useApiToken } from '../../hooks/auth';
import { ApiError, WithPath } from '../../models/models';
import { userApi } from '../../services/api';
import { registerSchema, registerValues } from '../../utils/auth';
import { loginRoute, registerRoute, tripsRoute } from '../../utils/routes';
import { getErrorMessage, processError } from '../../utils/utils';

export interface RegisterProps extends RouteComponentProps {}

const Register: React.FC<RegisterProps> = (props) => {
  const history = useHistory<WithPath>();
  const hasBeenOnLogin = React.useMemo(() => {
    return history.location.state?.path === loginRoute.paths[0];
  }, [history.location.state]);
  const goBack = React.useCallback(() => {
    history.goBack();
  }, [history]);

  const toast = useToast();

  const token = useApiToken();

  const registerMutation = useMutation<
    AuthResponse,
    ApiError,
    AuthLocalRegisterPostRequest
  >(userApi.authLocalRegisterPost.bind(userApi), {
    onSuccess: ({ jwt, user: { username } }) => {
      toast({
        title: 'Registered',
        description: `Welcome ${username}!`,
        status: 'success',
        isClosable: true,
      });

      token.setItem(jwt);

      props.history.push(tripsRoute.paths[0]);
    },
    onError: async (apiError) => {
      const error = await processError(apiError);
      toast({
        title: 'Failed to register',
        description: getErrorMessage(error),
        status: 'error',
        isClosable: true,
      });
    },
  });

  const registerForm = useFormik({
    validateOnMount: true,
    initialValues: registerValues,
    validationSchema: registerSchema,
    onSubmit: (values) => {
      return registerMutation.mutateAsync({ newUsersPermissionsUser: values });
    },
  });

  const hasUsernameError = React.useMemo(() => {
    return !!(registerForm.touched.username && registerForm.errors.username);
  }, [registerForm]);
  const hasEmailError = React.useMemo(() => {
    return !!(registerForm.touched.email && registerForm.errors.email);
  }, [registerForm]);
  const hasPasswordError = React.useMemo(() => {
    return !!(registerForm.touched.password && registerForm.errors.password);
  }, [registerForm]);
  const hasRepeatPasswordError = React.useMemo(() => {
    return !!(
      registerForm.touched.repeatPassword && registerForm.errors.repeatPassword
    );
  }, [registerForm]);

  return (
    <Card>
      <Heading mb={8} textAlign="center">
        Register
      </Heading>

      <form onSubmit={registerForm.handleSubmit}>
        <FormControl mt={6} isRequired isInvalid={hasUsernameError}>
          <FormLabel htmlFor="username">Name</FormLabel>
          <Input
            id="username"
            type="text"
            placeholder="John Smith"
            {...registerForm.getFieldProps('username')}
          />
          <FormErrorMessage>{registerForm.errors.username}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isRequired isInvalid={hasEmailError}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@smith.com"
            {...registerForm.getFieldProps('email')}
          />
          <FormErrorMessage>{registerForm.errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isRequired isInvalid={hasPasswordError}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            {...registerForm.getFieldProps('password')}
          />
          <FormErrorMessage>{registerForm.errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isRequired isInvalid={hasRepeatPasswordError}>
          <FormLabel htmlFor="repeatPassword">Repeat Password</FormLabel>
          <Input
            id="repeatPassword"
            type="password"
            {...registerForm.getFieldProps('repeatPassword')}
          />
          <FormErrorMessage>
            {registerForm.errors.repeatPassword}
          </FormErrorMessage>
        </FormControl>

        <Button
          colorScheme="blue"
          mt={8}
          type="submit"
          disabled={!registerForm.isValid}
          isLoading={registerForm.isSubmitting}
          loadingText="Registering"
          leftIcon={<registerRoute.Icon />}
        >
          Register
        </Button>
      </form>

      <Flex mt={10} flexDirection="column" alignItems="center">
        <Text mb={2} color="gray.500">
          If you already have an account you can log in below.
        </Text>
        {hasBeenOnLogin ? (
          <ChakraLink onClick={goBack}>Login</ChakraLink>
        ) : (
          <Link to={loginRoute.paths[0]}>Login</Link>
        )}
      </Flex>
    </Card>
  );
};

export default Register;
