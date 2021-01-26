import { Flex } from '@chakra-ui/react';

export const rowHeight = 100;

export const rowWrapperProps: React.ComponentProps<typeof Flex> = {
  height: `${rowHeight - 20}px`,
  flexDirection: 'column',
  borderWidth: 1,
  borderRadius: 'lg',
  justifyContent: 'center',
};
