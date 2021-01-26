import {
  ChakraProvider,
  ColorModeOptions,
  ColorModeProvider,
} from '@chakra-ui/react';
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';
import { mutationCache, queryCache } from '../../config/config';
import Layout from '../Layout/Layout';
import Auth from './AuthProvider';
import TripsProvider from './TripsProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
    },
  },
  queryCache,
  mutationCache,
});

const colorModeOptions: ColorModeOptions = { initialColorMode: 'dark' };

export interface ProviderProps {}

const Provider: React.FC<ProviderProps> = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ChakraProvider>
          <ColorModeProvider options={colorModeOptions}>
            <Auth>
              <TripsProvider>
                <Layout>{props.children}</Layout>
              </TripsProvider>
            </Auth>
          </ColorModeProvider>
        </ChakraProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default Provider;
