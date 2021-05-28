import { Paper } from '@material-ui/core';
import ChangeContext from 'contexts/InputChangeContext';
import { ModalBaseProps } from 'components/component_interfaces';
import { CreateEditCheckboxField, CreateEditDateField, MakeEditField } from 'components/form/create_form_components';
import { getInputTypesOfT, objHasErrors } from 'components/form/form_helpers';
import { UserAlertStrings, WorkflowStrings } from 'constants/strings';
import { TelemetryAlert } from 'types/alert';
import { LocationEvent } from 'types/location_event';
import EditModal from '../common/EditModal';
import { useState } from 'react';
import LocationEventForm from './LocationEventForm';
import { removeProps } from 'utils/common';
import MortalityEvent from 'types/mortality_event';
import { IUpsertPayload } from 'api/api_interfaces';
import useDidMountEffect from 'hooks/useDidMountEffect';
import { formatLabel } from 'types/common_helpers';
import { Tooltip } from 'components/common';

type MortEventProps = ModalBaseProps & {
  alert: TelemetryAlert;
  handleSave: (event: MortalityEvent) => void;
};

/**
 * todo: unassign device?
 * missing pcod fields?
 * not savable when on display
 * errors
 */
export default function MortalityEventForm({ alert, open, handleClose, handleSave }: MortEventProps): JSX.Element {
  const [errors, setErrors] = useState({});
  const [mortalityEvent, setMortalityEvent] = useState<MortalityEvent>(
    new MortalityEvent(alert.critter_id, alert.collar_id, alert.device_id)
  );
  const [locationEvent, setLocationEvent] = useState<LocationEvent>(new LocationEvent('mortality', alert.valid_from));
  const [isRetrieved, setIsRetrieved] = useState<boolean>(false);

  const formFields = getInputTypesOfT<MortalityEvent>(
    mortalityEvent,
    mortalityEvent.editableProps.map((c) => ({ prop: c })),
    mortalityEvent.propsThatAreCodes
  );
  const required = true;

  const deviceUnassignedField = formFields.find((f) => f.key === 'shouldUnattachDevice');
  const retrievedField = formFields.find((f) => f.key === 'retrieved');
  const retrievedDateField = formFields.find((f) => f.key === 'retrieval_date');
  const animalStatusField = formFields.find((f) => f.key === 'animal_status');
  const pcodField = formFields.find((f) => f.key === 'proximate_cause_of_death');
  // const pcodConfidenceValueField = formFields.find(f => f.key === 'pcod_confidence_value');
  const vasField = formFields.find((f) => f.key === 'vendor_activation_status');
  // const deviceStatusFields = formFields.filter(f => ['device_status', 'device_deployment_status'].includes(f.key))

  /**
   * break the MortalityEvent into collar/critter specific properties
   * before passing to the parent save handler
   * @param payload the save payload passed from the {EditModal}
   */
  const onSave = async (payload: IUpsertPayload<MortalityEvent>): Promise<void> => {
    const { body } = payload;
    body.location_event = locationEvent;
    await handleSave(body);
    handleClose(false);
  };
  useDidMountEffect(() => {
    // trigger re-render of retrieved_date field
    // todo: delete this field on-save if disabled?
  }, [isRetrieved]);

  useDidMountEffect(() => {
    setMortalityEvent(new MortalityEvent(alert.critter_id, alert.collar_id, alert.device_id));
    setLocationEvent(new LocationEvent('mortality', alert.valid_from));
  }, [alert]);

  if (!animalStatusField) {
    return <div>oops..</div>;
  }

  const Header = (
    <Paper className={'dlg-full-title'} elevation={3}>
      <h1>{UserAlertStrings.mortalityFormTitle} </h1>
      <div className={'dlg-full-sub'}>
        <span className='span'>WLH ID: {alert.wlh_id}</span>
        {alert.animal_id ? (
          <>
            <span className='span'>|</span>
            <span className='span'>Animal ID: {alert.animal_id}</span>
          </>
        ) : null}
        <span className='span'>|</span>
        <span className='span'>Device: {alert.device_id}</span>
      </div>
    </Paper>
  );

  return (
    <EditModal<MortalityEvent>
      showInFullScreen={false}
      handleClose={handleClose}
      onSave={onSave}
      editing={mortalityEvent}
      // hasErrors={(): boolean => objHasErrors(errors)}
      open={open}
      headerComponent={Header}
      hideHistory={true}>
      <ChangeContext.Consumer>
        {(handlerFromContext): JSX.Element => {
          // override the modal's onChange function
          const onChange = (v: Record<string, unknown>, modifyCanSave = true): void => {
            if (v) {
              setErrors((o) => removeProps(o, [Object.keys(v)[0]]));
            }
            // update the disabled status of the retrieved_date field
            if (Object.keys(v).includes('retrieved')) {
              setIsRetrieved(v.retrieved as boolean);
            }
            handlerFromContext(v, modifyCanSave);
          };

          const onChangeLocationProp = (v: Record<string, unknown>): void => {
            // when switching coordinate types...dont make form savable
            if (Object.values(v).includes(undefined)) {
              return;
            }
            // the property name will be the 'key' of the first key in Object.values
            const justProp = { [Object.keys(v)[0]]: v.error };
            const newErrors = Object.assign(errors, justProp);
            setErrors(newErrors);

            const l = Object.assign(locationEvent, v);
            setLocationEvent(l);
            handlerFromContext(l, true);
          };

          return (
            <>
              {/* form body */}
              <Paper elevation={0} className={'dlg-full-form'}>
                {/* <Paper elevation={3} className={'dlg-full-body-details'}> */}
                <div className={'dlg-details-section'}>
                  <h3>Update Assignment Details</h3>
                  <Tooltip
                    title={<p>{WorkflowStrings.mortalityUnassignDeviceTooltip}</p>}
                    placement='right'
                    enterDelay={750}>
                    <div>
                      {CreateEditCheckboxField({
                        formType: deviceUnassignedField,
                        label: formatLabel(mortalityEvent, deviceUnassignedField.key),
                        handleChange: onChange
                      })}
                    </div>
                  </Tooltip>
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Update Device Details</h3>
                  <Tooltip
                    title={
                      <p>
                        If <strong>checked</strong>, <i>Device Deployment Status</i> will be automatically set to{' '}
                        <em>"Not Deployed"</em>.
                      </p>
                    }
                    placement='right'
                    enterDelay={750}>
                    <div>
                      {CreateEditCheckboxField({
                        formType: retrievedField,
                        label: formatLabel(mortalityEvent, retrievedField.key),
                        handleChange: onChange
                      })}
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={<p>TODO: If <strong>checked</strong>then...</p>}
                    placement='right'
                    enterDelay={750}>
                    <div>
                      {retrievedDateField
                        ? CreateEditDateField({
                          formType: retrievedDateField,
                          label: formatLabel(mortalityEvent, retrievedDateField?.key),
                          handleChange: onChange,
                          disabled: !isRetrieved
                        })
                        : null}
                    </div>
                  </Tooltip>
                  <Tooltip
                    title={<p>TODO: If <strong>checked</strong>then...</p>}
                    placement='right'
                    enterDelay={750}>
                    <div style={{ marginBottom: '10px' }}>
                      {CreateEditCheckboxField({
                        formType: vasField,
                        label: formatLabel(mortalityEvent, vasField.key),
                        handleChange: onChange
                      })}
                    </div>
                  </Tooltip>
                  {/* deviceStatusFields.map((formType) => {
                      return MakeEditField({
                        formType,
                        handleChange: onChange,
                        required,
                        errorMessage: !!errors[formType.key] && (errors[formType.key]),
                      });
                    }) */}
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Update Animal Details</h3>
                  {animalStatusField
                    ? MakeEditField({ formType: animalStatusField, handleChange: onChange, required, errorMessage: '' })
                    : null}
                  <div style={{ marginBottom: '18px' }}>
                    {pcodField
                      ? MakeEditField({ formType: pcodField, handleChange: onChange, required, errorMessage: '' })
                      : null}
                  </div>
                </div>
                <div className={'dlg-details-section'}>
                  <h3>Mortality Event Details &amp; Comment</h3>
                  <LocationEventForm event={locationEvent} handleChange={onChangeLocationProp} />
                </div>
              </Paper>
            </>
          );
        }}
      </ChangeContext.Consumer>
    </EditModal>
  );
}
