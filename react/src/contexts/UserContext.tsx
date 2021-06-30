import { IUserUpsertPayload } from 'api/user_api';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useState, createContext, useEffect, useContext } from 'react';
import { User, IKeyCloakSessionInfo } from 'types/user';

export interface IUserContext {
  session: IKeyCloakSessionInfo;
  user: User;
  error?: string;
  ready?: boolean;
}

export const UserContext = createContext<IUserContext>({
  session: null,
  user: null,
  error: null,
  ready: false
});

export const UserContextDispatch = createContext(null);

/**
 * provided in @file {App.tsx}
 * user information is retrieved from two endpoints:
    * a) user table in the database @function getUser which includes the BCTW specific user role (ex. admin)
    * b) the proxy server endpoint that retrieves keycloak session info @function getSessionInfo

  * if the user table's row is outdated, ie keycloak has newer info, update it 
 */
export const UserStateContextProvider: React.FC = (props) => {
  const api = useTelemetryApi();
  // instantiatethe context
  const [userContext, setUserContext] = useState<IUserContext>({ ready: false, user: null, session: null});

  // fetch the BCTW user specific data
  const { isError: isUserError, data: userData, status: userStatus, error: userError } = api.useUser();
  // fetch the keycloak session data
  const { isError: isSessionError, data: sessionData, status: sessionStatus, error: sessionError } = api.useUserSessionInfo();
  // todo: setup the mutation for when there are keycloak object changes
  const onSuccess = (v: User): void => {
    console.log('new user object is', v);
  }
  const onError = (e): void => {
    console.log('error saving user', e)
  }
  const { mutateAsync } = api.useMutateUser({onSuccess, onError });

  // when the user data is fetched...
  useEffect(() => {
    if (userStatus === 'success') {
      setUserContext({ ready: true, user: userData, session: userContext.session });
    } 
  }, [userStatus]);

  // when the session data is fetched
  useEffect(() => {
    if (sessionStatus === 'success') {
      setUserContext({ ready: userContext.ready, session: sessionData, user: userContext.user });
      handleUserChanged(sessionData);
    }
  }, [sessionStatus]);

  // when there was an error retrieving data
  useEffect(() => {
    if (sessionError || userError) {
      const err = isUserError ? userError : isSessionError ? sessionError : null;
      const error = err?.response?.data?.error;
      console.log('failed to retrieve user or session info', error);
      const user = isUserError ? null : userContext.user;
      const session = isSessionError ? null: userContext.session;
      setUserContext({ ready: false, error, session, user })
    }
  }, [sessionError, userError])

  /**
   * keycloak session may be different/newer than what is persisted in the database.
   * when the context loads the user, check the fields are the same, if there are differences,
   * upsert them
   * fixme: should idir/bceid be updated?
   */
  const handleUserChanged = async (session: IKeyCloakSessionInfo): Promise<void> => {
    const { user } = userContext;
    // if the user hasn't been retrieved yet, dont do anything
    if (!user) {
      return;
    }
    if (session.email === user.email && session.family_name === user.lastname && session.given_name === user.firstname) {
      // no updates required
      return;
    }
    const newUser = Object.assign({}, user);
    newUser.email = session.email;
    newUser.firstname = session.given_name;
    newUser.lastname = session.family_name;
    const payload: IUserUpsertPayload = {
      user: newUser,
      role: user.role_type
    }
    console.log(`keycloak session object has new info, upserting new user ${JSON.stringify(payload)}`);
    await mutateAsync(payload);
  }

  return (
    <UserContext.Provider value={userContext}>
      <UserContextDispatch.Provider value={setUserContext}>{props.children}</UserContextDispatch.Provider>
    </UserContext.Provider>
  );
};

const useUserContextDispatch = () => {
  const context = useContext(UserContextDispatch);
  return context;
}
export { useUserContextDispatch }
