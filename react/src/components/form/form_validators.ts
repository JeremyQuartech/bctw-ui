import { FormStrings } from 'constants/strings';

const mustBeNegativeNumber = (v: number): string => (v > 0 ? FormStrings.validateNegativeLongitude : '');

const mustBeXDigits = (v: number, numDigits: number): string =>
  v?.toString().length === numDigits ? '' : `Field must be ${numDigits} digits in length`;

const mustBeEmail = (email: string): string => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase()) ? '' : 'Must be a valid email';
}


export { mustBeNegativeNumber, mustBeXDigits, mustBeEmail };
