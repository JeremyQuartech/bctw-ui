import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { ApiProps } from 'api/api_interfaces';
import {
  getCurrentOnboardStatus,
  handleOnboardingRequest as handleURL,
  submitOnboardingRequest as submitURL,
  getOnboardingRequests as getURL
} from 'api/api_endpoint_urls';
import { IOnboardUser, HandleOnboardInput, OnboardUser } from 'types/onboarding';
import { useQueryClient } from 'react-query';

export const onboardingApi = (props: ApiProps) => {
  const { api } = props;
  const queryClient = useQueryClient();

  const invalidate = (): void => {
    queryClient.invalidateQueries('getOnboardRequests');
  };
  /**
   * from the requests page, when an unauthorized user submits a request
   * to be granted access to BCTW
   */
  const submitOnboardingRequest = async (body: IOnboardUser): Promise<IOnboardUser> => {
    const url = createUrl({ api: submitURL });
    console.log('posting new user to be onboarded', body);
    const { data } = await api.post(url, body);
    return data;
  };

  /**
   *
   * @param body @type {IHandleOnboardRequestInput}
   * @returns a boolea depending on if the request was granted or denied.
   */
  const handleOnboardingRequest = async (body: HandleOnboardInput): Promise<boolean> => {
    const url = createUrl({ api: handleURL });
    console.log('posting grant/deny onboard new user to be onboarded', body);
    const { data } = await api.post(url, body);
    invalidate();
    return data;
  };

  /**
   * @returns retrieves existing (and granted/denied) onboarding requests
   * used in an admin only interface
   */
  const getOnboardingRequests = async (): Promise<IOnboardUser[]> => {
    const url = createUrl({ api: getURL });
    const { data } = await api.get(url);
    return data.map((json: IOnboardUser) => plainToClass(OnboardUser, json));
  };

  /**
   * unauthorized endpoint that retrieves the current status of a non-existing user's onboard status
   */
  const getOnboardStatus = async (): Promise<Pick<IOnboardUser, 'access'>> => {
    const { data } = await api.get(createUrl({ api: getCurrentOnboardStatus }));
    return data;
  };

  return {
    getOnboardStatus,
    getOnboardingRequests,
    handleOnboardingRequest,
    submitOnboardingRequest
  };
};
