import { render, screen } from '@testing-library/react';
import React from 'react';
import App from './App';

test('renders title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Travel Plans/i);
  expect(linkElement).toBeInTheDocument();
});
