
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

export const isNonZeroValue = (value: number): boolean => {
  return value !== 0 && value !== null && value !== undefined;
};
