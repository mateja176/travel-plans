import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  useBoolean,
  useToast,
} from '@chakra-ui/react';
import { useFormik } from 'formik';
import React from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import {
  MdArrowBack,
  MdCancel,
  MdDelete,
  MdEdit,
  MdKeyboardArrowDown,
  MdKeyboardArrowUp,
} from 'react-icons/md';
import { useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import Link from '../../components/Link';
import { newKey } from '../../config/config';
import AuthContext from '../../context/AuthContext';
import {
  AuthLocalRegisterPostRequest,
  AuthResponse,
  UsersIdDeleteRequest,
  UsersIdPutRequest,
  UsersPermissionsRole,
  UsersPermissionsUser,
} from '../../generated/api';
import { role, UserRouteProps } from '../../models/auth';
import { ApiError } from '../../models/models';
import { userApi, userRoleApi } from '../../services/api';
import {
  createUserSchema,
  CreateUserValues,
  createUserValues,
  roleValueToRoleLabel,
  updateUserSchema,
  UpdateUserValues,
  userToInitialUserValues,
} from '../../utils/auth';
import { Routes } from '../../utils/routes';
import {
  getErrorMessage,
  getErrorStatusCode,
  processError,
  setMatch,
} from '../../utils/utils';

export interface UserProps extends UserRouteProps {
  routes: Routes;
}

const User: React.FC<UserProps> = (props) => {
  const initialUser = props.location.state?.user;

  const history = useHistory();

  const toast = useToast();

  const [retry, setRetry] = useBoolean();
  const userQuery = useQuery<UsersPermissionsUser, ApiError>(
    props.location.pathname,
    () => userApi.usersIdGet({ id: props.match.params.id }),
    {
      enabled: props.match.params.id !== newKey && !initialUser,
      retry,
      onError: (error) => {
        if (getErrorStatusCode(error) === 404) {
          history.replace(props.routes.users.paths[0]);

          toast({
            title: 'User not found',
            description:
              'The link is invalid or the resource is no longer available.',
            isClosable: true,
          });
        } else {
          setRetry.on();
        }
      },
    },
  );

  const user = React.useMemo(() => {
    return initialUser ?? userQuery.data;
  }, [initialUser, userQuery.data]);
  const initialUserValues = React.useMemo(() => {
    return user && userToInitialUserValues(user);
  }, [user]);

  const usersContext = React.useContext(AuthContext);

  const isNew = React.useMemo(() => {
    return props.match.params.id === newKey;
  }, [props.match.params.id]);

  const [isEditing, setIsEditing] = useBoolean(isNew);

  const createUserMutation = useMutation<
    AuthResponse,
    ApiError,
    AuthLocalRegisterPostRequest
  >(userApi.authLocalRegisterPost.bind(userApi), {
    onSuccess: (result) => {
      setIsEditing.off();

      toast({
        title: 'User created.',
        description: `${result.user.username} can now log in.`,
        status: 'success',
        isClosable: true,
      });

      usersContext.insertItem(result.user);

      props.history.push(setMatch(result.user.id, props.routes.user.paths[1]));
    },
    onError: async (apiError) => {
      const error = await processError(apiError);

      toast({
        title: 'Failed create user.',
        description: getErrorMessage(error),
        status: 'error',
        isClosable: true,
      });
    },
  });
  const updateUserMutation = useMutation<
    UsersPermissionsUser,
    ApiError,
    UsersIdPutRequest
  >(userApi.usersIdPut.bind(userApi), {
    onSuccess: (result) => {
      setIsEditing.off();

      toast({
        title: 'User edited.',
        description: `${result.username} is now up to date.`,
        status: 'success',
        isClosable: true,
      });

      props.history.replace({
        pathname: props.location.pathname,
        state: { user: result },
      });

      usersContext.setItem(result);
    },
    onError: async (apiError) => {
      const error = await processError(apiError);
      const description = getErrorMessage(error);
      toast({
        title: 'Failed edit user.',
        description,
        status: 'error',
        isClosable: true,
      });
    },
  });
  const userRolesQuery = useQuery<{ roles: UsersPermissionsRole[] }, ApiError>(
    '/users-permissions/roles',
    () => userRoleApi.usersPermissionsRolesGet({}),
    {
      enabled: false,
      onError: async (apiError) => {
        const error = await processError(apiError);

        toast({
          status: 'error',
          title: 'Failed to edit user',
          description: getErrorMessage(error),
        });
      },
    },
  );

  const createUserForm = useFormik(
    React.useMemo(
      () => ({
        validateOnMount: true,
        initialValues: createUserValues,
        validationSchema: createUserSchema,
        onSubmit: (values: CreateUserValues) => {
          return createUserMutation.mutateAsync({
            newUsersPermissionsUser: values,
          });
        },
      }),
      [createUserMutation],
    ),
  );

  const updateUserForm = useFormik(
    React.useMemo(
      () => ({
        enableReinitialize: true,
        validateOnMount: true,
        initialValues: initialUserValues ?? createUserValues,
        validationSchema: updateUserSchema,
        onSubmit: ({ role: roleName, ...values }: UpdateUserValues) => {
          if (roleName !== initialUserValues?.role) {
            return userRolesQuery.refetch().then(({ data }) => {
              const roleId = data?.roles.find((role) => role.name === roleName)
                ?.id;

              return updateUserMutation.mutateAsync({
                id: props.match.params.id,
                newUsersPermissionsUser: {
                  username: values.username,
                  email: values.email,
                  ...(roleId ? { role: roleId } : {}),
                  ...(values.password ? { password: values.password } : {}),
                },
              });
            });
          } else {
            return updateUserMutation.mutateAsync({
              id: props.match.params.id,
              newUsersPermissionsUser: {
                username: values.username,
                email: values.email,
                ...(values.password ? { password: values.password } : {}),
              },
            });
          }
        },
      }),
      [
        props.match.params.id,
        updateUserMutation,
        initialUserValues,
        userRolesQuery,
      ],
    ),
  );

  const form = isNew ? createUserForm : updateUserForm;

  const hasUsernameError = React.useMemo(() => {
    return !!(form.touched.username && form.errors.username);
  }, [form]);
  const hasEmailError = React.useMemo(() => {
    return !!(form.touched.email && form.errors.email);
  }, [form]);
  const hasRoleError = React.useMemo(() => {
    return !!(form.touched.role && form.errors.role);
  }, [form]);
  const hasPasswordError = React.useMemo(() => {
    return !!(form.touched.password && form.errors.password);
  }, [form]);
  const hasRepeatPasswordError = React.useMemo(() => {
    return !!(form.touched.repeatPassword && form.errors.repeatPassword);
  }, [form]);

  const deleteTripMutation = useMutation<
    object,
    ApiError,
    UsersIdDeleteRequest
  >(userApi.usersIdDelete.bind(userApi), {
    onSuccess: () => {
      if (user) {
        toast({
          status: 'success',
          title: 'User deleted',
          description: `"${user.username}" has been delete.`,
          isClosable: true,
        });

        history.replace(props.routes.users.paths[0]);

        usersContext.removeItem(user.id);
      }
    },
    onError: async (apiError) => {
      const error = await processError(apiError);

      toast({
        status: 'error',
        title: 'Failed to delete',
        description: getErrorMessage(error),
        isClosable: true,
      });
    },
  });
  const handleDelete = React.useCallback(() => {
    if (user) {
      deleteTripMutation.mutate({ id: user.id });
    }
  }, [deleteTripMutation, user]);
  const [isAlertOpen, setIsAlertOpen] = useBoolean();
  const cancelDeleteRef = React.useRef<HTMLButtonElement | null>(null);

  const handleCancel = React.useCallback(() => {
    setIsEditing.off();

    createUserForm.resetForm();
  }, [setIsEditing, createUserForm]);

  return (
    <Flex height="100%" flexDirection="column">
      <Flex mt={6} justifyContent="space-between">
        <Link to={props.routes.users.paths[0]}>
          <Button leftIcon={<MdArrowBack />}>Back</Button>
        </Link>
        {!isNew && (
          <Skeleton isLoaded={!!initialUserValues}>
            <Button
              mr={4}
              onClick={setIsAlertOpen.on}
              colorScheme="red"
              leftIcon={<MdDelete />}
            >
              Delete
            </Button>
            <AlertDialog
              isOpen={isAlertOpen}
              leastDestructiveRef={cancelDeleteRef}
              onClose={setIsAlertOpen.off}
            >
              <AlertDialogOverlay>
                <AlertDialogContent>
                  <AlertDialogHeader fontSize="lg" fontWeight="bold">
                    Delete User
                  </AlertDialogHeader>

                  <AlertDialogBody>
                    Are you sure? You can't undo this action afterwards.
                  </AlertDialogBody>

                  <AlertDialogFooter>
                    <Button ref={cancelDeleteRef} onClick={setIsAlertOpen.off}>
                      Cancel
                    </Button>
                    <Button colorScheme="red" onClick={handleDelete} ml={3}>
                      Delete
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialogOverlay>
            </AlertDialog>
            {isEditing ? (
              <Button
                onClick={handleCancel}
                colorScheme="red"
                leftIcon={<MdCancel />}
              >
                Cancel
              </Button>
            ) : (
              <Button
                onClick={setIsEditing.on}
                leftIcon={<MdEdit />}
                colorScheme="blue"
              >
                Edit
              </Button>
            )}
          </Skeleton>
        )}
      </Flex>
      {isNew ? (
        <Flex mt={6} alignItems="center">
          <Heading ml={4}>Create New User</Heading>
        </Flex>
      ) : (
        <Skeleton mt={6} isLoaded={!!initialUserValues}>
          <Flex alignItems="center">
            <Heading ml={4}>
              {initialUserValues?.username ?? 'Placeholder'}
            </Heading>
          </Flex>
        </Skeleton>
      )}

      <form onSubmit={form.handleSubmit}>
        <FormControl mt={6} isRequired isInvalid={hasUsernameError}>
          <FormLabel htmlFor="username">Name</FormLabel>
          <Input
            id="username"
            type="text"
            placeholder="John Smith"
            {...form.getFieldProps('username')}
          />
          <FormErrorMessage>{form.errors.username}</FormErrorMessage>
        </FormControl>

        {!isNew && (
          <FormControl mt={6} isRequired isInvalid={hasRoleError}>
            <FormLabel htmlFor="role">Role</FormLabel>
            <Menu>
              {({ isOpen }) => (
                <>
                  <MenuButton as={Box} cursor="pointer">
                    <Flex>
                      <Input
                        id="role"
                        type="role"
                        readOnly
                        value={roleValueToRoleLabel(form.values.role)}
                        borderRightRadius={0}
                      />
                      <IconButton
                        borderLeftRadius={0}
                        borderWidth={1}
                        borderLeftWidth={0}
                        icon={
                          isOpen ? (
                            <MdKeyboardArrowUp />
                          ) : (
                            <MdKeyboardArrowDown />
                          )
                        }
                        aria-label="Search"
                      />
                    </Flex>
                  </MenuButton>
                  <MenuList>
                    {Object.entries(role).map(([label, value]) => (
                      <MenuItem
                        key={value}
                        onClick={() => {
                          form.setFieldValue('role', value);
                        }}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </>
              )}
            </Menu>
            <FormErrorMessage>{form.errors.email}</FormErrorMessage>
          </FormControl>
        )}

        <FormControl mt={6} isRequired isInvalid={hasEmailError}>
          <FormLabel htmlFor="email">Email</FormLabel>
          <Input
            id="email"
            type="email"
            placeholder="john@smith.com"
            {...form.getFieldProps('email')}
          />
          <FormErrorMessage>{form.errors.email}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isRequired={isNew} isInvalid={hasPasswordError}>
          <FormLabel htmlFor="password">Password</FormLabel>
          <Input
            id="password"
            type="password"
            {...form.getFieldProps('password')}
          />
          <FormErrorMessage>{form.errors.password}</FormErrorMessage>
        </FormControl>

        <FormControl
          mt={6}
          isRequired={isNew}
          isInvalid={hasRepeatPasswordError}
          isDisabled={!form.values.password}
        >
          <FormLabel htmlFor="repeatPassword">Repeat Password</FormLabel>
          <Input
            id="repeatPassword"
            type="password"
            {...form.getFieldProps('repeatPassword')}
          />
          <FormErrorMessage>{form.errors.repeatPassword}</FormErrorMessage>
        </FormControl>

        <Button
          colorScheme="blue"
          mt={8}
          type="submit"
          disabled={!form.isValid}
          isLoading={form.isSubmitting}
          loadingText="Registering"
          leftIcon={<props.routes.register.Icon />}
        >
          Submit
        </Button>
      </form>
    </Flex>
  );
};

export default User;
