export const readOrigin = (): string => {
  const origin = process.env.ORIGIN;

  if (!origin) {
    throw new Error('Please specify ORIGIN env var.');
  }

  return origin;
};

export const readToken = (): string => {
  const token = process.env.TOKEN;

  if (!token) {
    throw new Error('Please specify TOKEN env var.');
  }

  return token;
};
