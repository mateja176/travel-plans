import React from 'react';

export interface TripsIconProps {}

const TripsIcon: React.FC<TripsIconProps> = (
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLElement>,
    HTMLElement
  >,
) => <i {...props}>🌴</i>;

export default TripsIcon;
