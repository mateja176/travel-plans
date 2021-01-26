import {
  Box,
  Container,
  useDisclosure,
  useMediaQuery,
  useToast,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import React from 'react';
import { useQuery } from 'react-query';
import { useHistory, useLocation } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import Print from '../../components/Print';
import { mutationCache, queryCache } from '../../config/config';
import AuthContext from '../../context/AuthContext';
import PastTripsContext from '../../context/PastTripsContext';
import TripsContext from '../../context/TripsContext';
import { Trip } from '../../generated/api';
import { useCurrentUserQuery } from '../../hooks/auth';
import { ApiError } from '../../models/models';
import { tripApi } from '../../services/api';
import { loginRoute, tripRoute } from '../../utils/routes';
import { tripsAscSort } from '../../utils/trip';
import { getErrorMessage, processError } from '../../utils/utils';
import Header from './components/Header';

export interface LayoutProps {}

const Layout: React.FC<LayoutProps> = (props) => {
  const { currentUserQuery, tokenItem } = useCurrentUserQuery();

  const tripsContext = React.useContext(TripsContext);
  const pastTripsContext = React.useContext(PastTripsContext);
  const authContext = React.useContext(AuthContext);

  React.useEffect(() => {
    if (tokenItem.item) {
      currentUserQuery.refetch();
    }
  }, [tokenItem.item]); // eslint-disable-line react-hooks/exhaustive-deps

  const location = useLocation();

  const history = useHistory();

  const menuState = useDisclosure();
  const menuButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const handleLogout = React.useCallback(() => {
    menuState.onClose();

    tokenItem.removeItem();

    queryCache.clear();
    mutationCache.clear();

    history.push(loginRoute.paths[0]);

    tripsContext.clear();
    pastTripsContext.clear();
    authContext.clear();
  }, [
    tokenItem,
    history,
    menuState,
    tripsContext,
    pastTripsContext,
    authContext,
  ]);

  const [isMobile] = useMediaQuery('(max-width: 600px)');

  const handleCreate = React.useCallback(() => {
    history.push(tripRoute.paths[0]);
  }, [history]);

  const toast = useToast();

  const printRef = React.useRef<Print | null>(null);
  const tripsQuery = useQuery<Trip[], ApiError>(
    '/trips',
    () =>
      tripApi.tripsGet({
        startDateGt: Date.now().toString(),
        startDateLt: dayjs().add(30, 'days').valueOf().toString(),
        sort: tripsAscSort,
        userId: currentUserQuery.data?.id,
      }),
    {
      enabled: false,
      onError: async (apiError) => {
        const error = await processError(apiError);

        toast({
          title: 'Failed to print',
          description: getErrorMessage(error),
          status: 'error',
          isClosable: true,
        });
      },
    },
  );
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: '',
  });
  const print = React.useMemo(
    () => ({
      onPrint: handlePrint
        ? () => {
            tripsQuery.refetch().then(handlePrint);
          }
        : () => {},
      isPrinting: tripsQuery.isLoading,
    }),
    [tripsQuery, handlePrint],
  );

  const authState = React.useMemo(() => {
    return currentUserQuery.data
      ? {
          onLogout: handleLogout,
          name: currentUserQuery.data?.username,
        }
      : null;
  }, [currentUserQuery, handleLogout]);

  return (
    <Container height="100%" display="flex" flexDirection="column">
      <Header
        menuButtonRef={menuButtonRef}
        menuState={menuState}
        token={tokenItem}
        isMobile={isMobile}
        onCreate={handleCreate}
        print={print}
        authState={authState}
        pathname={location.pathname}
      />
      <Box flexGrow={1}>{props.children}</Box>
      <Box display="none">
        <Print ref={printRef} trips={tripsQuery.data ?? []} />
      </Box>
    </Container>
  );
};

export default Layout;
