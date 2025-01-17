import Icon from '@mdi/react';
import { mdiCheckAll, mdiLogin, mdiCloseBox } from '@mdi/js';
import { IconButton } from '@mui/material';
import './style.css';

const UserAccessApproved = (): JSX.Element => {
  const logOut = () => {
    // TODO: Find keycloak logout functionality
    console.log('log out')
  };

  return (
    <div className='onboarding-container'>
      <div className='icon'>
        <Icon
          path={mdiCheckAll}
          size={2}
          color='#64dd17'
          className="icon"
        ></Icon>
      </div>
      <div className='title'>
        <h2>Request Approved</h2>
      </div>
      <div className='description'>Your request for access has been approved</div>

      <IconButton color="secondary" onClick={logOut} size="large">
        <a href='/logout#/logout'>
          <Icon
            path={mdiCloseBox}
            size={1}
          ></Icon>
          Log Out
        </a>
      </IconButton>

      <IconButton color='primary' size="large">
        <a href='/#/map'>
          <Icon
            path={mdiLogin}
            size={1}
          ></Icon>
          Enter
        </a>
      </IconButton>
    </div>
  );
}
export default UserAccessApproved;
