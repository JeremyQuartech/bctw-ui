import { Collar } from 'types/collar';
import { BCTWBase, nullToDayjs, uuid } from 'types/common_types';
import { Expose, Transform } from 'class-transformer';
import dayjs, { Dayjs } from 'dayjs';
import { columnToHeader } from 'utils/common_helpers';
import { DataLife, IDataLifeStartProps, IDataLifeEndProps } from 'types/data_life';
import { isDev } from 'api/api_helpers';
import { Code } from 'types/code';
import { Animal } from './animal';

// passed to the API when attaching a device to an animal
export interface IAttachDeviceProps extends IDataLifeStartProps, IDataLifeEndProps,
  Pick<Animal, 'critter_id'>, Pick<Collar, 'collar_id'> { }

export interface ICollarHistory extends
  Pick<Collar, 'collar_id' | 'device_id' | 'device_make' | 'frequency'>, DataLife,
  Pick<Animal, 'critter_id'> {
  assignment_id: uuid;
}

// passed to the API when removing a device from an animal
export interface IRemoveDeviceProps extends Required<IDataLifeEndProps>, Pick<ICollarHistory, 'assignment_id'> { }

// used to get type safe array of keys
type CollarHistoryProps = keyof ICollarHistory;

/**
 * represents an device attachment to an animal.
 */
export class CollarHistory extends BCTWBase implements ICollarHistory {
  assignment_id: uuid; // primary key of the collar_animal_assignment table
  collar_id: uuid;
  critter_id: uuid;
  device_id: number;
  device_make: Code;
  frequency: number;
  @Transform(nullToDayjs) data_life_start: Dayjs; 
  @Transform(nullToDayjs) data_life_end: Dayjs;
  @Transform(nullToDayjs) attachment_start: Dayjs;
  @Transform(nullToDayjs) attachment_end: Dayjs;

  @Expose() get identifier(): string { return 'assignment_id' }

  toJSON(): CollarHistory {
    return this;
  }

  // note: endpoint for retrieving collar history displays additional collar/animal properties
  // type safe properties to display in tables
  static get propsToDisplay(): CollarHistoryProps[] {
    const props: CollarHistoryProps[] = ['device_id', 'device_make', 'attachment_start', 'data_life_start', 'data_life_end', 'attachment_end'];
    if (isDev()) {
      props.unshift('assignment_id');
    }
    return props;
  }

  formatPropAsHeader(str: keyof CollarHistory): string {
    switch (str) {
      case this.identifier:
        return 'Assignment ID';
      default:
        return columnToHeader(str as string);
    }
  }
}

/**
 * @returns a boolean indicating if the @param history contains a
 * valid animal/device attachment - if there is a record with a valid_to 
 * that is null or in the future
 */
export const hasCollarCurrentlyAssigned = (history: CollarHistory[]): CollarHistory | undefined => {
  const currentlyAssigned = history?.filter((h) => {
    // a null valid_to is considered valid - as in it has no expiry
    if (!h.data_life_end.isValid()) {
      return true;
    }
    return dayjs().isBefore(h.data_life_end);
  });
  return currentlyAssigned.length ? currentlyAssigned[0] : undefined;
}