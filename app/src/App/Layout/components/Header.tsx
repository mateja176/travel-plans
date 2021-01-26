import {
  Avatar,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  IconButton,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import React from 'react';
import { MdCreate, MdExitToApp, MdMenu, MdPrint } from 'react-icons/md';
import Link from '../../../components/Link';
import TripsIcon from '../../../components/TripsIcon';
import { UsersPermissionsUser } from '../../../generated/api';
import { LocalStorageItem } from '../../../models/models';
import { tripRoute } from '../../../utils/routes';
import Navigation from './Navigation';

export interface HeaderProps {
  menuButtonRef: React.MutableRefObject<HTMLButtonElement | null>;
  isMobile: boolean;
  authState: null | {
    onLogout: () => void;
    name: UsersPermissionsUser['username'];
  };
  onCreate: () => void;
  print: { onPrint: () => void; isPrinting: boolean };
  token: LocalStorageItem<string>;
  menuState: ReturnType<typeof useDisclosure>;
  pathname: string;
}

const Header: React.FC<HeaderProps> = ({
  menuButtonRef,
  isMobile,
  token,
  onCreate,
  print,
  menuState,
  authState,
  pathname,
}) => {
  return (
    <Flex marginY={3} justifyContent="space-between" alignItems="center">
      <Link to="/">
        <TripsIcon /> Travel Plans
      </Link>
      {!!token.item && (
        <Flex>
          {isMobile ? (
            <>
              {pathname !== tripRoute.paths[0] && (
                <Tooltip label="Create new Trip">
                  <IconButton
                    icon={<MdCreate />}
                    onClick={onCreate}
                    colorScheme="blue"
                    aria-label="Create new trip"
                  />
                </Tooltip>
              )}
              <Tooltip label="Print next month's trips">
                <IconButton
                  ml={4}
                  icon={<MdPrint />}
                  onClick={print.onPrint}
                  isLoading={print.isPrinting}
                  colorScheme="green"
                  aria-label="Print trips"
                />
              </Tooltip>
            </>
          ) : (
            <>
              {pathname !== tripRoute.paths[0] && (
                <Button
                  onClick={onCreate}
                  leftIcon={<MdCreate />}
                  colorScheme="blue"
                >
                  Create Trip
                </Button>
              )}
              <Tooltip label="Print next month's trips">
                <Button
                  ml={4}
                  onClick={print.onPrint}
                  isLoading={print.isPrinting}
                  loadingText="Printing"
                  leftIcon={<MdPrint />}
                  colorScheme="green"
                >
                  Print Trips
                </Button>
              </Tooltip>
            </>
          )}
          <IconButton
            ml={4}
            ref={menuButtonRef}
            icon={<MdMenu />}
            onClick={menuState.onToggle}
            aria-label="Toggle menu"
          />
          {authState && (
            <Drawer
              isOpen={menuState.isOpen}
              placement="right"
              onClose={menuState.onClose}
              finalFocusRef={menuButtonRef}
            >
              <DrawerOverlay>
                <DrawerContent>
                  <DrawerCloseButton />
                  <DrawerHeader>Navigation</DrawerHeader>

                  <DrawerBody
                    display="flex"
                    flexDirection="column"
                    justifyContent="space-between"
                  >
                    <Navigation onItemClick={menuState.onClose} />
                    <Flex alignItems="center" ml="15px">
                      <Avatar mr={4} name={authState.name} />
                      {authState.name}
                    </Flex>
                  </DrawerBody>

                  <DrawerFooter justifyContent="stretch">
                    <Button
                      w="100%"
                      ml={4}
                      onClick={authState.onLogout}
                      leftIcon={<MdExitToApp />}
                    >
                      Log out
                    </Button>
                  </DrawerFooter>
                </DrawerContent>
              </DrawerOverlay>
            </Drawer>
          )}
        </Flex>
      )}
    </Flex>
  );
};

export default Header;
