import React, { useState } from 'react';
import { LocationEvent } from 'types/location_event';
import DateInput from 'components/form/Date';
import TextField from 'components/form/TextInput';
import { InputChangeHandler } from 'components/component_interfaces';
import { getInputTypesOfT } from 'components/form/form_helpers';
import { FormControlLabel, Radio, RadioGroup } from '@material-ui/core';
import { WorkflowStrings } from 'constants/strings';
import NumberInput from 'components/form/NumberInput';
import { mustBeNegativeNumber, mustBeXDigits } from 'components/form/form_validators';
import { formatLabel } from 'types/common_helpers';

type LocationEventProps = {
  event: LocationEvent;
  handleChange: InputChangeHandler;
};

export default function LocationEventForm(props: LocationEventProps): JSX.Element {
  const { event, handleChange } = props;
  const [useUTM, setUseUTM] = useState<string>('utm');

  const formFields = getInputTypesOfT(event, Object.keys(event).map(p => ({prop: p as keyof LocationEvent})), []);

  // create the form inputs
  const longField = formFields.find((f) => f.key.includes('longitude'));
  const latField = formFields.find((f) => f.key.includes('latitude'));
  const utmFields = formFields.filter((f) => f.key.includes('utm'));
  const dateField = formFields.find((f) => f.key.includes('date'));
  const commentField = formFields.find((f) => f.key.includes('comment'));

  const changeCoordinateType = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.value;
    setUseUTM(val);
  }

  const baseInputProps = { changeHandler: handleChange, required: true };
  return (
    <>
      <DateInput
        propName={dateField.key}
        label={formatLabel(event, dateField.key)}
        defaultValue={dateField.value as Date}
        {...baseInputProps}
      />
      {/* show the UTM or Lat/Long fields depending on this checkbox state */}
      <RadioGroup
        row
        aria-label='position'
        name='position'
        value={useUTM}
        onChange={changeCoordinateType}>
        <FormControlLabel
          value={'utm'}
          control={<Radio color='primary' />}
          label={WorkflowStrings.locationEventCoordTypeUTM}
          labelPlacement='start'
        />
        <FormControlLabel
          value={'coords'}
          control={<Radio color='primary' />}
          label={WorkflowStrings.locationEventCoordTypeLat}
          labelPlacement='start'
        />
      </RadioGroup>
      <div style={{ marginTop: '20px', height: '120px' }}>
        {useUTM === 'utm' ? (
          utmFields.map((f) => {
            const numberProps = { ...baseInputProps, label: formatLabel(event, f.key), propName: f.key };
            if (f.key === 'utm_easting') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 6);
            } else if (f.key === 'utm_northing') {
              numberProps['validate'] = (v: number): string => mustBeXDigits(v, 7);
            }
            return f.key === 'utm_zone' ? (
              <div>
                <NumberInput {...numberProps} />
              </div>
            ) : (
              <span className={'edit-form-field-span'}>
                <NumberInput {...numberProps} />
              </span>
            );
          })
        ) : (
          <>
            <NumberInput propName={latField.key} {...baseInputProps} label={formatLabel(event, latField.key)} />
            <NumberInput
              propName={longField.key}
              {...baseInputProps}
              label={formatLabel(event, longField.key)}
              validate={mustBeNegativeNumber}
            />
          </>
        )}
      </div>
      <div>
        <TextField
          style={{ width: '100%' }}
          multiline={true}
          rows={2}
          key={commentField.key}
          propName={commentField.key}
          defaultValue={commentField.value as string}
          label={formatLabel(event, commentField.key)}
          changeHandler={handleChange}
        />
      </div>
    </>
  );
}
