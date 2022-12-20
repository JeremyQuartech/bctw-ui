import dayjs, { Dayjs } from 'dayjs';
import { Code } from 'types/code';
import { columnToHeader, omitNull } from 'utils/common_helpers';
import { BCTWWorkflow, WorkflowType, OptionalAnimal, eventToJSON } from 'types/events/event';
import { LocationEvent } from 'types/events/location_event';
import { Animal } from 'types/animal';
import { IDataLifeStartProps } from 'types/data_life';
import { eInputType, FormFieldObject } from 'types/form_types';
import { WorkflowStrings } from 'constants/strings';
import { CollarHistory } from 'types/collar_history';
import { uuid } from 'types/common_types';

type CaptureAnimalEventProps = Pick<
  Animal,
  | 'critter_id'
  | 'animal_id'
  | 'wlh_id'
  | 'species'
  | 'recapture_ind'
  | 'translocation'
  | 'associated_animal_id'
  | 'associated_animal_relationship'
  | 'region'
  | 'population_unit'
  | 'captivity_status'
>;

type ReleaseAnimalProps = Pick<
  Animal,
  | 'ear_tag_left_id'
  | 'ear_tag_right_id'
  | 'ear_tag_left_colour'
  | 'ear_tag_right_colour'
  | 'juvenile_at_heel'
  | 'juvenile_at_heel_count'
  | 'animal_colouration'
  | 'life_stage'
>;

type CaptureReleaseProps = {
  // workflow should proceed to release workflow
  wasReleased: boolean;
  // workflow should proceed to mortality workflow
  didDieDuringCapture: boolean;
  didDieDuringTransloc: boolean;
  // indicates the animal was released after successful translocation
  // workflow should proceed to release
  isTranslocationComplete: boolean;
};

export type CaptureFormField = {
  [Property in keyof CaptureEvent]+?: FormFieldObject<CaptureEvent>;
};
/**
 * capture date / data life ??!?
 * assume data life is the capture date?
 */
export default class CaptureEvent
  implements
    CaptureAnimalEventProps,
    ReleaseAnimalProps,
    Readonly<Pick<CollarHistory, 'assignment_id'>>,
    IDataLifeStartProps,
    BCTWWorkflow<CaptureEvent>,
    CaptureReleaseProps
{
  // workflow props
  readonly event_type: WorkflowType;
  shouldSaveDevice: boolean;
  readonly shouldSaveAnimal = true;
  isAssociated: boolean; // has an animal association
  location_event: LocationEvent;
  wasReleased: boolean;
  didDieDuringCapture: boolean;
  didDieDuringTransloc: boolean;
  isTranslocationComplete: boolean;
  // data life props
  readonly assignment_id: uuid;
  attachment_start: Dayjs;
  data_life_start: Dayjs;
  // critter props
  readonly critter_id: uuid;
  readonly wlh_id: string;
  readonly animal_id: string;
  species: Code;
  recapture_ind: boolean;
  translocation: boolean;
  associated_animal_id: string;
  associated_animal_relationship: Code; // required if associated_animal_id populated
  // region & popunit are enabled when animal is translocated
  region: Code;
  population_unit: Code;
  captivity_status: boolean;
  // characteristic fields
  ear_tag_left_id: string;
  ear_tag_right_id: string;
  ear_tag_left_colour: string;
  ear_tag_right_colour: string;
  juvenile_at_heel: Code;
  juvenile_at_heel_count: number;
  animal_colouration: string;
  life_stage: Code;

  constructor() {
    this.event_type = 'capture';
    this.recapture_ind = false;
    this.translocation = false;
    this.isTranslocationComplete = true;
    this.location_event = new LocationEvent('capture', dayjs());
  }

  formatPropAsHeader(s: keyof CaptureEvent): string {
    switch (s) {
      case 'captivity_status':
        return WorkflowStrings.captivity.isCaptive;
      case 'associated_animal_relationship':
        return 'Associated Relationship';
      case 'isTranslocationComplete':
        return WorkflowStrings.capture.isTranslocCompleted;
      default:
        return columnToHeader(s);
    }
  }
  get displayProps(): (keyof CaptureEvent)[] {
    return ['wlh_id', 'animal_id'];
  }
  getWorkflowTitle(): string {
    return WorkflowStrings.capture.workflowTitle;
  }

  get captureCritterPropsToSave(): (keyof Animal)[] {
    return [
      'critter_id',
      'recapture_ind',
      'translocation',
      'species',
      'associated_animal_id',
      'associated_animal_relationship',
      'captivity_status',
      'ear_tag_left_colour',
      'ear_tag_left_id',
      'ear_tag_right_colour',
      'ear_tag_right_id',
      'juvenile_at_heel',
      'juvenile_at_heel_count',
      'animal_colouration',
      'life_stage'
    ];
  }

  getAnimal(): OptionalAnimal {
    const props = this.captureCritterPropsToSave;
    if (this.translocation) {
      // if the translocation is completed, save the new region/population unit.
      // otherwise, need to update animal_status to 'in translocation';
      if (this.isTranslocationComplete) {
        props.push('region', 'population_unit');
      } else {
        props.push('animal_status');
      }
    }
    const ret = eventToJSON(props, this);
    if (!this.juvenile_at_heel) {
      delete ret.juvenile_at_heel_count;
    }
    if (this.translocation && !this.isTranslocationComplete) {
      ret['animal_status'] = 'In Translocation';
    }
    if (!ret.associated_animal_id) {
      delete ret.associated_animal_relationship;
    }
    return omitNull({ ...ret, ...this.location_event.toJSON() });
  }

  // todo: should data life be updated??
  // getDataLife(): ChangeDataLifeInput{
  //   if (!this.assignment_id|| !this.location_event.date) {
  //     console.error('cannot update data life in capture event, missing props', this);
  //     return null;
  //   }
  //   const ret: ChangeDataLifeInput = {
  //     assignment_id: this.assignment_id,
  //     data_life_start: this.location_event.date.format(formatTime)
  //   }
  //   return ret;
  // }

  fields: CaptureFormField = {
    isTranslocationComplete: { prop: 'isTranslocationComplete', type: eInputType.check },
    didDieDuringTransloc: { prop: 'didDieDuringTransloc', type: eInputType.check }
  };
}
