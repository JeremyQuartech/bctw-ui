import TextField from 'components/form/TextInput';
import NumberField from 'components/form/NumberInput';
import SelectCode from './SelectCode';
import DateInput from 'components/form/Date';
import CheckBox from 'components/form/Checkbox';
import React from 'react';
import { columnToHeader } from 'utils/common';
import { eInputType, FormInputType } from 'types/form_types';

type CreateInputBaseProps = {
  formType: FormInputType;
  handleChange: (v: Record<string, unknown>) => void;
};

type CreateInputProps = CreateInputBaseProps & {
  label?: string;
  disabled?: boolean;
  errorMessage?: string;
  required?: boolean;
  span?: boolean;
};

function CreateEditTextField(props: CreateInputProps): JSX.Element {
  const { key, value, type } = props.formType;
  return typeof value === 'number' ? (
    <NumberField
      propName={key}
      key={key}
      defaultValue={value as number}
      changeHandler={props.handleChange}
      {...props}
    />
  ) : (
    <TextField
      key={key}
      propName={key}
      defaultValue={value as string}
      type={type}
      {...props}
      changeHandler={props.handleChange}
      error={!!props.errorMessage ?? false}
      helperText={props.errorMessage}
    />
  );
}

function CreateEditDateField({ formType, handleChange, label, disabled }: CreateInputProps): JSX.Element {
  return (
    <DateInput
      propName={formType.key}
      label={label}
      defaultValue={formType.value as Date}
      changeHandler={handleChange}
      disabled={disabled}
    />
  );
}

function CreateEditCheckboxField({ formType, handleChange, label, disabled }: CreateInputProps): JSX.Element {
  return (
    <CheckBox
      changeHandler={handleChange}
      initialValue={formType.value as boolean}
      label={label}
      propName={formType.key}
      disabled={disabled}
    />
  );
}

function CreateEditSelectField({
  formType,
  handleChange,
  disabled,
  required,
  errorMessage,
  label
}: CreateInputProps): JSX.Element {
  return (
    <SelectCode
      style={{ width: '200px', marginRight: '10px' }}
      label={label}
      disabled={disabled}
      key={formType.key}
      codeHeader={formType?.codeName ?? formType.key}
      defaultValue={formType.value as string}
      changeHandler={handleChange}
      required={required}
      error={!!errorMessage?.length}
      className={'select-control-small'}
    />
  );
}

function MakeEditField({
  formType,
  handleChange,
  label,
  disabled = false,
  errorMessage = '',
  required = false,
  span = false
}: CreateInputProps): React.ReactNode {
  const inputType = formType.type;
  const lbl = label ?? columnToHeader(formType.key);
  let Comp: React.ReactNode;
  if (inputType === eInputType.check) {
    Comp = CreateEditCheckboxField({ formType, handleChange, disabled, label: lbl });
  } else if (inputType === eInputType.date) {
    Comp = CreateEditDateField({ formType, handleChange, disabled, label: lbl });
  } else if (inputType === eInputType.select) {
    Comp = CreateEditSelectField({ formType, handleChange, disabled, required, errorMessage, label: lbl });
  } else if (inputType === eInputType.text || inputType === eInputType.number) {
    Comp = CreateEditTextField({ formType, handleChange, errorMessage, disabled, required, label: lbl });
  }
  return span ? (
    <span className={'edit-form-field-span'}>{Comp}</span>
  ) : (
    <div key={formType.key} className={'edit-form-field'}>
      {Comp}
    </div>
  );
}

export { CreateEditTextField, CreateEditDateField, CreateEditCheckboxField, CreateEditSelectField, MakeEditField };
