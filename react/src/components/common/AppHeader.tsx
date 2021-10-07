import 'styles/AppHeader.scss';

import { mdiAccountCircle, mdiAccountRemove, mdiBell, mdiHelpCircle, mdiProgressClock } from '@mdi/js';
import { useContext, useState } from 'react';
import { AlertContext } from 'contexts/UserAlertContext';
import { IconButton } from '@material-ui/core';
import { User } from 'types/user';
import { UserContext } from 'contexts/UserContext';
import headerImage from 'assets/images/gov3_bc_logo.png';
import useDidMountEffect from 'hooks/useDidMountEffect';
import Icon from '@mdi/react';
import Modal from 'components/modal/Modal';
import UserAlert from 'pages/user/UserAlertPage';
import { urls } from 'constants/external_urls';

type AppheaderProps = {
  children?: JSX.Element;
};

const AppHeader = ({children}: AppheaderProps): JSX.Element => {
  // load the contexts
  const useUser = useContext(UserContext);
  const useAlert = useContext(AlertContext);

  const [user, setUser] = useState<User>();
  const [alertCount, setAlertCount] = useState(0);
  const [showAlerts, setShowAlerts] = useState(false);

  // when the UserContext is loaded, set the session info state 
  useDidMountEffect(() => {
    const { user } = useUser;
    if (user) {
      setUser(user);
    }
  }, [useUser]);

  // toggle top navigation menu
  const topNavStyle = {
    display: user?.role_type ? 'inline' : 'none'
  }

  // toggle request access menu
  const requestAccessTopNavStyle = {
    display: user?.role_type ? 'none' : 'inline'
  }

  // when the AlertContext is loaded, set the alert state
  useDidMountEffect(() => {
    const { alerts } = useAlert;
    if (alerts.length) {
      setAlertCount(alerts.length);
    }
    else {
      setShowAlerts(false);
    }
  }, [useAlert]);

  const getAlertTitle = (): string => {
    const alerts = useAlert?.alerts;
    if (!alerts?.length) {
      return 'Alerts(0)';
    }
    const numSnoozed = alerts.filter(a => a.isSnoozed).length;
    const snoozedStr = numSnoozed ? `Snoozed (${numSnoozed})` : '';
    return `Alerts that require action (${alerts.length - numSnoozed}) ${snoozedStr}`;
  }

  return (
    <header className={'app-header'}>
      <div className={'container'}>
        <a href='/home' className={'brand'} color={'inherit'}>
          <img src={headerImage} width={155} height={52} alt={'Government of British Columbia'} />
          BCTW
        </a>
        <nav id={'top-nav'} className={'app-nav'} style={topNavStyle}>
          <ul>
            <li>
              <a href='/home' color={'inherit'}>Home</a>
            </li>
            <li>
              <a href='/map' color={'inherit'}>Map</a>
            </li>
            <li>
              <a href='/manage' color={'inherit'}>Manage</a>
            </li>
          </ul>
        </nav>
        <nav id={'request-access-top-nav'} className={'app-nav'} style={requestAccessTopNavStyle}>
          <ul>
            <li>
              <a href='/onboarding' color={'inherit'}>Request Access</a>
            </li>
          </ul>
        </nav>
        <nav className='profile-nav'>
          <ul className={'header-ul'}>
            {alertCount > 0 ? (
              <li>
                <div className={'alerts'}>
                  <IconButton onClick={(): void => setShowAlerts((o) => !o)} disabled={!alertCount}>
                    <Icon
                      path={mdiBell}
                      color={alertCount ? 'red' : 'white'}
                      className={'icon'}
                      title='User Alerts'
                      size={1}
                    />
                    {alertCount}
                  </IconButton>
                </div>
              </li>
            ) : null}
            <li className={'username'}>
              <a href='/profile'>
                <IconButton>
                  <Icon
                    path={user ? mdiAccountCircle : useUser.error ? mdiAccountRemove : mdiProgressClock}
                    className={'icon'}
                    title='User Profile'
                    size={1}
                  />
                </IconButton>
              </a>
              <a href='/profile'><span color={'inherit'}>{user?.firstname ?? 'Guest'}</span>&nbsp;<span>{user?.lastname ?? 'User'}</span></a>
            </li>
            <li className={'help'}>
              <a href={urls.bctw_support_url} target='_blank'>
                <IconButton>
                  <Icon
                    path={mdiHelpCircle}
                    className={'icon'}
                    title='Help'
                    size={1}
                  />
                </IconButton>
              </a>
              <a href={urls.bctw_support_url} target='_blank'><span color={'inherit'}>Help</span></a>
            </li>
            <li className={'logout'}>
              <span><a href='/logout'><span color={'inherit'}>Logout</span></a></span>
            </li>
            <li>{children}</li>
          </ul>
        </nav>
      </div>
      <Modal title={getAlertTitle()} open={showAlerts} handleClose={(): void => setShowAlerts(false)}>
        <UserAlert />
      </Modal>
    </header>
  );
};

export default AppHeader;