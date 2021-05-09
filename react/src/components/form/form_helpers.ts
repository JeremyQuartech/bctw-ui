import { getProperty } from 'utils/common';

export enum eInputType {
  text = 'text',
  number = 'number',
  select = 'select',
  check = 'check',
  unknown = 'unknown',
  date = 'date'
}

const stringsThatAreBools = ['true', 'false'];
// some properties that should be stored as booleans in the db arent.
const propsToRenderAsCheckbox = [];

export type FormInputType = {
  key: string;
  type: eInputType;
  value: unknown;
};
/**
 * @param obj the object being edited
 * @param editableProps object properties to be added as form inputs
 * @param selectableProps which properties will be used in select inputs
 * @return array of @type {FormInputType}
 */
function getInputTypesOfT<T>(obj: T, editableProps: string[], selectableProps: string[]): FormInputType[] {
  return editableProps.map((key: string) => {
    if (selectableProps.includes(key)) {
      return { key, type: eInputType.select, value: obj[key] };
    }
    if (stringsThatAreBools.includes(obj[key]) || propsToRenderAsCheckbox.includes(key)) {
      return { key, type: eInputType.check, value: obj[key] };
    }
    const valType = getProperty(obj, key as any);
    const value = obj[key];
    if (typeof (valType as Date)?.getDay === 'function') {
      return { key, type: eInputType.date, value };
    } else {
      switch (typeof valType) {
        case 'number':
          return { key, type: eInputType.number, value };
        case 'boolean':
          return { key, type: eInputType.check, value };
        case 'string':
        default:
          return { key, type: eInputType.text, value };
      }
    }
  });
}

// returns true if the object has any non-prototype properties
const isValidEditObject = <T>(obj: T): boolean => Object.keys(obj).length > 0;

/**
 * basic form validator for required fields
 * @param o the object of type T being validated
 * @param required required keys that must have a value to be considered valid
 */
const validateRequiredFields = <T>(o: T, required: string[]): Record<string, unknown> => {
  const errors = {};
  required.forEach((field) => {
    if (!o[field]) {
      errors[field] = 'Required';
    } else {
      delete errors[field];
    }
  });
  return errors;
};

/**
 * given an error object, determine if it contains errors.
 * it contains an error if the value is anything that js evaluates to true
 * ex. '' and undefined would be false, but 'hi' would be true
 */
const objHasErrors = (errorObj: Record<string, unknown>): boolean => {
  return !!Object.values(errorObj).filter(f => f).length;
};

export { getInputTypesOfT, isValidEditObject, validateRequiredFields, objHasErrors };
