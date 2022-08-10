export const isValidAmountInput = (input: string) => {
  const regex = /\d{1,10}\.\d{1,2}|\d{1,10}\.?|\.?\d{0,2}/;
  const resp = regex.exec(input);

  return resp && resp[0] === resp.input;
};
