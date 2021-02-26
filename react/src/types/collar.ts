import { columnToHeader } from 'utils/common';
import { BCTW, BctwBaseType } from 'types/common_types';
import { Type, Expose } from 'class-transformer';

// fetchable api collar types
export enum eCollarAssignedStatus {
  Assigned = 'Assigned', // currently attached to a critter
  Available = 'Available'
}

// used when creating new collars manually
export enum eNewCollarType {
  Other = '',
  VHF = 'VHF',
  Vect = 'Vectronics'
}
export interface ICollarBase {
  collar_id: string;
}
export interface ICollarTelemetryBase extends ICollarBase {
  radio_frequency: number;
  // satellite_network: string;
  collar_status;
  device_id: number;
}

export interface ICollar extends ICollarTelemetryBase, BCTW, BctwBaseType {
  collar_make: string;
  collar_model: string;
  deployment_status: string;
  collar_status: string;
  collar_type: string;
  deactivated: boolean;
  malfunction_date: Date;
  max_transmission_date: Date;
  reg_key: string;
  retreival_date: Date;
  animal_id?: string; // get collars includes this if collar attached
}

export class Collar implements ICollar {
  collar_id: string;
  device_id: number;
  collar_make: string;
  collar_model: string;
  deployment_status: string;
  collar_status: string;
  collar_type: string;
  @Type(() => Boolean) deactivated: boolean;
  radio_frequency: number;
  @Type(() => Date) malfunction_date: Date;
  @Type(() => Date) max_transmission_date: Date;
  reg_key: string;
  @Type(() => Date) retreival_date: Date;
  satellite_network: string;
  animal_id?: string;
  @Type(() => Date) valid_from: Date;
  @Type(() => Date) valid_to: Date;
  @Expose() get identifier(): string { return 'collar_id' }

  constructor(collar_type?: eNewCollarType) {
    if (collar_type) {
      switch(collar_type) {
        case eNewCollarType.VHF:
          this.collar_make = 'ATS';
          this.collar_type = 'VHF';
          return;
        case eNewCollarType.Vect:
          this.collar_type = 'VHF + GPS';
          return;
      }
    }
    this.radio_frequency = 0;
    this.device_id = 0;
  }

  formatPropAsHeader(str: string): string {
    switch (str) {
      case 'device_id':
        return 'Device ID';
      case 'animal_id':
        return 'Individual ID';
      case 'max_transmission_date':
        return 'Last Update';
      default:
        return columnToHeader(str);
    }
  }
}

// properties displayed on collar pages
const collarPropsToDisplay = [
  'device_id',
  'collar_make',
  'collar_status',
  'radio_frequency',
  'max_transmission_date', 
];

const attachedCollarProps = ['(WLH_ID/Animal ID)', ...collarPropsToDisplay];

const isCollar = (c: unknown): c is Collar => {
  const collar = c as Collar;
  return !!(collar.collar_id && collar.device_id);
};

export {
  attachedCollarProps,
  collarPropsToDisplay,
  isCollar,
};