import { isDev } from 'api/api_helpers';
import { AxiosError } from 'axios';

/**
 * formats an Axios error to a string
 */
const formatAxiosError = (err: AxiosError): string =>
  `${err?.response?.data?.error || 
    err?.response?.data || 
    err?.message || 
    'An error occured'}`;
export { formatAxiosError };
