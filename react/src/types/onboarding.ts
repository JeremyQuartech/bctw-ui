import { eUserRole, IUser, KeyCloakDomainType, UserBase } from 'types/user';
import { BCTWBase } from 'types/common_types';
import { columnToHeader } from 'utils/common_helpers';
import { isDev } from 'api/api_helpers';

/**
 * the 'access' column in the bctw.onboarding table
 */
export type OnboardingStatus = 'pending' | 'granted' | 'denied';
//
export interface IOnboardUser {
  onboarding_id: number;
  reason: string;
  access: OnboardingStatus;
}

export class OnboardUser extends UserBase implements BCTWBase<OnboardUser>, IOnboardUser {
  readonly onboarding_id: number;
  domain: KeyCloakDomainType;
  username: string;
  reason: string;

  access: OnboardingStatus;
  role_type: eUserRole;

  get identifier(): keyof OnboardUser {
    return 'onboarding_id';
  }

  formatPropAsHeader(s: keyof OnboardUser): string {
    return columnToHeader(s);
  }

  get displayProps(): (keyof OnboardUser)[] {
    const props: (keyof OnboardUser)[] = [
      'domain',
      'username',
      'firstname',
      'lastname',
      'email',
      'phone',
      'access',
      'role_type',
      'reason'
    ];
    if (isDev()) {
      props.unshift('onboarding_id');
    }
    return props;
  }
}

// what an admin passes to the API to grant/deny an onboard request
export type HandleOnboardInput = Pick<IOnboardUser, 'onboarding_id' | 'access'> & Pick<IUser, 'role_type'>;