import { createUrl } from 'api/api_helpers';
import { plainToClass } from 'class-transformer';
import { TelemetryAlert } from 'types/alert';
import { eUDFType, IUDF, IUDFInput } from 'types/udf';
import { IUser, IUserCritterAccess, User, UserCritterAccess } from 'types/user';
import { upsertAlertEndpoint } from 'api/api_endpoint_urls';
import {
  IUserCritterPermissionInput,
  IGrantCritterAccessResults,
  IBulkUploadResults,
  ApiProps
} from 'api/api_interfaces';
import { eCritterPermission } from 'types/permission';

export const userApi = (props: ApiProps) => {
  const { api, testUser } = props;

  const addUser = async (body: User): Promise<User> => {
    const url = createUrl({ api: 'add-user'});
    const { data } = await api.post(url, body);
    const user = plainToClass(User, data);
    return user;
  }

  const getUser = async (): Promise<User> => {
    const url = createUrl({ api: 'get-user', testUser });
    // console.log('fetching user info');
    const { data } = await api.get(url);
    const user = plainToClass(User, data);
    return user;
  };

  const getUsers = async (page: number): Promise<User[]> => {
    const url = createUrl({ api: 'get-users', testUser });
    const { data } = await api.get(url);
    return data.map((json: IUser[]) => plainToClass(User, json));
  };

  const grantCritterAccessToUser = async (
    body: IUserCritterPermissionInput
  ): Promise<IBulkUploadResults<IGrantCritterAccessResults>> => {
    const url = createUrl({ api: 'assign-critter-to-user', testUser });
    const { data } = await api.post(url, body);
    const { results, errors } = data;
    return { results, errors };
  };

  const getUserCritterAccess = async (
    page: number,
    user: User,
    filterOutNone = false
  ): Promise<UserCritterAccess[]> => {
    const filters = `owner,subowner,view,change${!filterOutNone ? ',none' : ''}`;
    const url = createUrl({ api: `get-critter-access/${user.idir}`, query: `filters=${filters}`, page });
    const { data } = await api.get(url);
    const converted = data.map((json: IUserCritterAccess[]) => plainToClass(UserCritterAccess, json));
    return filterOutNone ? converted.filter((d) => d.permission_type !== eCritterPermission.none) : converted;
  };

  const getUserAlerts = async (
  ): Promise<TelemetryAlert[]> => {
    // console.log('fetching user alerts')
    const url = createUrl({api: 'get-user-alerts'});
    const { data } = await api.get(url);
    const converted = data?.map((json) => plainToClass(TelemetryAlert, json));
    return converted;
  }

  const updateAlert = async (body: TelemetryAlert[]): Promise<TelemetryAlert[]> => {
    const url = createUrl({api: upsertAlertEndpoint});
    const { data } = await api.post(url, body);
    if (data && data.length) {
      const converted = data?.map((json) => plainToClass(TelemetryAlert, json));
      return converted;
    }
    return [];
  }

  const getUDF = async (
    udf_type: eUDFType
  ): Promise<IUDF[]> => {
    const url = createUrl({api: 'get-udf', query: `type=${udf_type}`});
    const { data } = await api.get(url);
    return data;
  }

  const upsertUDF = async (
    udfs: IUDFInput[]
  ): Promise<IUDF[]> => {
    const url = createUrl({api: 'add-udf'});
    const { data } = await api.post(url, udfs);
    return data;
  }

  return {
    addUser,
    getUDF,
    getUserCritterAccess,
    grantCritterAccessToUser,
    getUser,
    getUsers,
    getUserAlerts,
    upsertUDF,
    updateAlert,
  };
};
