import { eInputType, FormInputType } from 'components/form/form_helpers';
import TextField from 'components/form/Input';
import { BCTW } from 'types/common_types';
import SelectCode from './SelectCode';
/*
  todo: boolean, date
*/

/**
 * 
 * @param iType 
 * @param changeHandler 
 * @param hasError 
 * @param editing 
 * @param canEdit 
 * @param required 
 * @param errText 
 * @returns 
 */
function CreateEditTextField<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean,
  errText: string
): JSX.Element {
  return (
    <TextField
      key={iType.key}
      propName={iType.key}
      defaultValue={iType.value}
      type={iType.type}
      label={editing.formatPropAsHeader(iType.key)}
      disabled={!canEdit}
      changeHandler={changeHandler}
      required={required}
      error={hasError}
      helperText={errText}
    />
  );
}

function CreateEditSelectField<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean
): JSX.Element {
  return (
    <SelectCode
      labelTitle={editing.formatPropAsHeader(iType.key)}
      disabled={!canEdit}
      key={iType.key}
      codeHeader={iType.key}
      defaultValue={iType.value as string}
      changeHandler={changeHandler}
      required={required}
      error={hasError}
    />
  );
}

function MakeEditFields<T extends BCTW>(
  iType: FormInputType,
  changeHandler: (v: Record<string, unknown>) => void,
  hasError: boolean,
  editing: T,
  canEdit: boolean,
  required: boolean,
  errText: string
): React.ReactNode {
  return iType.type === eInputType.select ? (
    <div key={iType.key} className={'edit-form-field'}>
      {CreateEditSelectField(iType, changeHandler, hasError, editing, canEdit, required)}
    </div>
  ) : (
    <div key={iType.key} className={'edit-form-field'}>
      {CreateEditTextField(iType, changeHandler, hasError, editing, canEdit, required, errText)}
    </div>
  );
}

export { CreateEditTextField, CreateEditSelectField, MakeEditFields };