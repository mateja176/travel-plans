import { Box, Flex } from '@chakra-ui/react';
import React from 'react';

export interface CardProps {}

const Card: React.FC<CardProps> = (props) => {
  return (
    <Flex height="100%" flexDirection="column" justifyContent="center">
      <Box borderRadius="lg" borderWidth={1} p={6}>
        {props.children}
      </Box>
    </Flex>
  );
};

export default Card;
