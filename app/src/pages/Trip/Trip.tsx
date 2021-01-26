import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  Flex,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  Heading,
  Input,
  Skeleton,
  Text,
  Textarea,
  useBoolean,
  useToast,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useFormik } from 'formik';
import qs from 'qs';
import { inc } from 'ramda';
import React from 'react';
import ReactDatePicker, { ReactDatePickerProps } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { MdArrowBack, MdCancel, MdDelete, MdEdit } from 'react-icons/md';
import { useMutation, useQuery } from 'react-query';
import { useHistory } from 'react-router-dom';
import Link from '../../components/Link';
import TripStatus from '../../components/Row/TripStatus';
import { newKey } from '../../config/config';
import PastTripsContext from '../../context/PastTripsContext';
import TripsContext from '../../context/TripsContext';
import {
  Trip as ITrip,
  TripsIdDeleteRequest,
  TripsIdPutRequest,
  TripsPostRequest,
  UsersPermissionsUser,
} from '../../generated/api';
import { ApiError } from '../../models/models';
import { ITripStatus, TripRouteProps } from '../../models/trip';
import { tripApi } from '../../services/api';
import { Routes, tripRoute, tripsRoute } from '../../utils/routes';
import { getStatusMilliseconds, getTripStatus } from '../../utils/trip';
import {
  getErrorMessage,
  getErrorStatusCode,
  processError,
  setMatch,
} from '../../utils/utils';
import './Trip.css';
import { getInitialTripValues, tripSchema, TripValues } from './utils';

dayjs.extend(duration);

const pad = (n: number) => n.toString().padStart(2, '0');

const getCountDown = (status: ITripStatus, trip: ITrip) => {
  const statusMilliseconds = getStatusMilliseconds(status, trip);

  const duration = dayjs.duration(statusMilliseconds[1]);
  const months = duration.months();
  const days = duration.days();
  const hours = duration.hours();
  const minutes = duration.minutes();
  const seconds = duration.seconds();

  const time =
    months && days
      ? `${months} Months and ${days} Days`
      : days
      ? `${days} Days`
      : `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  switch (statusMilliseconds[0]) {
    case 'ended':
      return `Before ${time}`;
    case 'active':
      return `Ends in ${time}`;
    default:
      return `In ${time}`;
  }
};

export interface TripProps extends TripRouteProps {
  user: UsersPermissionsUser;
  canCrudUsers: boolean;
  routes: Routes;
}

const Trip: React.FC<TripProps> = (props) => {
  const initialTrip = props.location.state?.trip;

  const history = useHistory();

  const toast = useToast();

  const [retry, setRetry] = useBoolean();
  const tripQuery = useQuery<ITrip, ApiError>(
    props.location.pathname,
    () => tripApi.tripsIdGet({ id: props.match.params.id }),
    {
      enabled: props.match.params.id !== newKey && !initialTrip,
      retry,
      onError: (error) => {
        if (getErrorStatusCode(error) === 404) {
          history.replace(tripsRoute.paths[0]);

          toast({
            title: 'Trip not found',
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

  const trip = React.useMemo(() => {
    return initialTrip ?? tripQuery.data;
  }, [initialTrip, tripQuery.data]);

  const status = React.useMemo(() => trip && getTripStatus(trip), [trip]);

  const [elapsedSeconds, setElapsedSeconds] = React.useState(0);
  React.useEffect(() => {
    setTimeout(() => {
      setElapsedSeconds(inc);
    }, 1000);
  }, [elapsedSeconds]);

  const tripsContext = React.useContext(TripsContext);
  const pastTripsContext = React.useContext(PastTripsContext);

  const [isEditing, setIsEditing] = useBoolean(
    props.match.params.id === newKey,
  );

  const createTripMutation = useMutation<ITrip, ApiError, TripsPostRequest>(
    tripApi.tripsPost.bind(tripApi),
    {
      onSuccess: (result) => {
        setIsEditing.off();

        toast({
          title: 'Trip created.',
          description: `${result.destination} here we come!`,
          status: 'success',
          isClosable: true,
        });

        tripsContext.insertItem(result);

        props.history.push(setMatch(result.id, tripRoute.paths[1]));
      },
      onError: async (apiError) => {
        const error = await processError(apiError);

        toast({
          title: 'Failed create trip.',
          description: getErrorMessage(error),
          status: 'error',
          isClosable: true,
        });
      },
    },
  );
  const updateTripMutation = useMutation<ITrip, ApiError, TripsIdPutRequest>(
    tripApi.tripsIdPut.bind(tripApi),
    {
      onSuccess: (result) => {
        setIsEditing.off();

        toast({
          title: 'Trip edited.',
          description: `${result.destination} is waiting for you.`,
          status: 'success',
          isClosable: true,
        });

        props.history.replace({
          pathname: props.location.pathname,
          state: { trip: result },
        });

        if (status === 'ended') {
          pastTripsContext.setItem(result);
        } else {
          tripsContext.setItem(result);
        }
      },
      onError: async (apiError) => {
        const error = await processError(apiError);
        toast({
          title: 'Failed edit trip.',
          description: getErrorMessage(error),
          status: 'error',
          isClosable: true,
        });
      },
    },
  );

  const { values: initialTripValues, tomorrow } = React.useMemo(
    getInitialTripValues,
    [],
  );

  const tripForm = useFormik(
    React.useMemo(
      () => ({
        enableReinitialize: true,
        validateOnMount: true,
        initialValues: trip ?? initialTripValues,
        validationSchema: tripSchema,
        onSubmit: (values: TripValues) => {
          if (props.match.params.id === newKey) {
            return createTripMutation.mutateAsync({
              newTrip: { ...values, user: props.user.id },
            });
          } else {
            return updateTripMutation.mutateAsync({
              id: props.match.params.id,
              newTrip: values,
            });
          }
        },
      }),
      [
        initialTripValues,
        props.match.params.id,
        createTripMutation,
        updateTripMutation,
        trip,
        props.user.id,
      ],
    ),
  );

  const hasDestinationError = React.useMemo(() => {
    return !!(tripForm.touched.destination && tripForm.errors.destination);
  }, [tripForm]);
  const hasStartDateError = React.useMemo(() => {
    return !!(tripForm.touched.startDate && tripForm.errors.startDate);
  }, [tripForm]);
  const hasEndDateError = React.useMemo(() => {
    return !!(tripForm.touched.endDate && tripForm.errors.endDate);
  }, [tripForm]);
  const hasCommentError = React.useMemo(() => {
    return !!(tripForm.touched.comment && tripForm.errors.comment);
  }, [tripForm]);

  const deleteTripMutation = useMutation<
    number,
    ApiError,
    TripsIdDeleteRequest
  >(tripApi.tripsIdDelete.bind(tripApi), {
    onSuccess: () => {
      if (trip) {
        toast({
          status: 'success',
          title: 'Trip deleted',
          description: `"${trip.destination}" has been delete.`,
          isClosable: true,
        });

        history.replace(tripsRoute.paths[0]);

        if (status === 'ended') {
          pastTripsContext.removeItem(trip.id);
        } else {
          tripsContext.removeItem(trip.id);
        }
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
    if (trip) {
      deleteTripMutation.mutate({ id: trip.id });
    }
  }, [deleteTripMutation, trip]);
  const [isAlertOpen, setIsAlertOpen] = useBoolean();
  const cancelDeleteRef = React.useRef<HTMLButtonElement | null>(null);

  const handleCancel = React.useCallback(() => {
    setIsEditing.off();

    tripForm.resetForm();
  }, [setIsEditing, tripForm]);

  const handleDateChange: ReactDatePickerProps['onChange'] = React.useCallback(
    (date) => {
      if (isEditing && Array.isArray(date)) {
        const [startDate, endDate] = date;
        tripForm.setFieldValue('startDate', startDate);
        tripForm.setFieldValue('endDate', endDate);
      }
    },
    [tripForm, isEditing],
  );
  const handleDateBlur = React.useCallback(() => {
    tripForm.setFieldTouched('startDate', true);
    tripForm.setFieldTouched('endDate', true);
  }, [tripForm]);

  const tripUser = React.useMemo(() => {
    return trip?.user as UsersPermissionsUser | undefined;
  }, [trip]);

  return (
    <Flex height="100%" flexDirection="column">
      <Flex mt={6} justifyContent="space-between">
        <Link
          to={
            status === 'ended'
              ? {
                  pathname: tripsRoute.paths[0],
                  search: qs.stringify({ status: 'ended' }),
                }
              : tripsRoute.paths[0]
          }
        >
          <Button leftIcon={<MdArrowBack />}>Back</Button>
        </Link>
        {props.match.params.id !== newKey && (
          <Skeleton isLoaded={!!trip}>
            <Flex>
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
                      Delete Trip
                    </AlertDialogHeader>

                    <AlertDialogBody>
                      Are you sure? You can't undo this action afterwards.
                    </AlertDialogBody>

                    <AlertDialogFooter>
                      <Button
                        ref={cancelDeleteRef}
                        onClick={setIsAlertOpen.off}
                      >
                        Cancel
                      </Button>
                      <Button colorScheme="red" onClick={handleDelete} ml={3}>
                        Delete
                      </Button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
              {status !== 'ended' &&
                (isEditing ? (
                  <Button onClick={handleCancel} leftIcon={<MdCancel />}>
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
                ))}
            </Flex>
          </Skeleton>
        )}
      </Flex>
      {props.match.params.id === newKey ? (
        <Flex mt={6} alignItems="center">
          <TripStatus status={'upcoming'} />{' '}
          <Heading ml={4}>Create New Trip</Heading>
        </Flex>
      ) : (
        <Skeleton mt={6} isLoaded={!!(trip && status)}>
          <Flex alignItems="center">
            {status && <TripStatus status={status} />}{' '}
            <Heading ml={4}>{trip?.destination ?? 'Placeholder'}</Heading>
          </Flex>
        </Skeleton>
      )}
      {props.match.params.id !== newKey && (
        <Skeleton isLoaded={!!trip}>
          <Heading as="h2" size="lg">
            {trip && status ? getCountDown(status, trip) : '00:00:00:00:00'} by
            {props.canCrudUsers && tripUser?.id && (
              <>
                {' '}
                <Text color="blue.500" display="inline-block">
                  <Link to={setMatch(tripUser.id, props.routes.user.paths[1])}>
                    {tripUser.username}
                  </Link>
                </Text>
              </>
            )}
          </Heading>
        </Skeleton>
      )}
      <form onSubmit={tripForm.handleSubmit}>
        <FormControl
          mt={6}
          isRequired={isEditing}
          isReadOnly={!isEditing}
          isInvalid={hasDestinationError}
        >
          <FormLabel htmlFor="destination">Destination</FormLabel>
          <Input
            id="destination"
            placeholder="Italy"
            {...tripForm.getFieldProps('destination')}
          />
          <FormErrorMessage>{tripForm.errors.destination}</FormErrorMessage>
        </FormControl>

        <FormControl
          mt={6}
          isRequired={isEditing}
          isReadOnly={!isEditing}
          isInvalid={hasStartDateError || hasEndDateError}
        >
          <FormLabel htmlFor="startDate" mb={4}>
            Start And End Date
          </FormLabel>

          <ReactDatePicker
            // initially selected
            selected={tripForm.values.startDate}
            onChange={handleDateChange}
            startDate={tripForm.values.startDate}
            minDate={tomorrow}
            endDate={tripForm.values.endDate}
            selectsRange
            inline
            onBlur={handleDateBlur}
            calendarClassName={isEditing ? '' : 'disabled'}
          />
          <FormHelperText>
            The minimum trip duration is one calendar day.
          </FormHelperText>

          <FormErrorMessage>{tripForm.errors.startDate}</FormErrorMessage>
          <FormErrorMessage>{tripForm.errors.endDate}</FormErrorMessage>
        </FormControl>

        <FormControl mt={6} isReadOnly={!isEditing} isInvalid={hasCommentError}>
          <FormLabel htmlFor="comment">Comment</FormLabel>
          <Textarea id="comment" {...tripForm.getFieldProps('comment')} />
          <FormErrorMessage>{tripForm.errors.comment}</FormErrorMessage>
        </FormControl>
        {status !== 'ended' && (
          <Button
            type="submit"
            disabled={!isEditing || !tripForm.isValid}
            isLoading={tripForm.isSubmitting}
            loadingText="Submitting"
            mt={8}
            colorScheme="blue"
          >
            Submit
          </Button>
        )}
      </form>
    </Flex>
  );
};

export default Trip;
