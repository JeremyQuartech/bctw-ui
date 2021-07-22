import { Box, Divider, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { RouteKey } from 'AppRouter';
import { Icon, Tooltip } from 'components/common';
import { UserContext } from 'contexts/UserContext';
import { useContext, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

type SideBarProps = {
  routes: RouteKey[]; // links at top of the drawer
  // sidebarContent?: React.ReactNode; // what's displayed in the drawer below the sidebar's navigation section
  collapseAble: boolean;
};

export default function SideBar({ routes }: SideBarProps): JSX.Element {
  // const classes = drawerStyles();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [visibleRoutes, setVisibleRoutes] = useState<RouteKey[]>(routes);
  // const [open, setOpen] = React.useState(false);
  const useUser = useContext(UserContext);

  // const handleDrawerOpen = (): void => setOpen((o) => !o);

  // enable user to see admin page if they have the role
  useEffect(() => {
    const updateComponent = (): void => {
      const { user } = useUser;
      if (user) {
        setIsAdmin(user.role_type === 'administrator');
        setIsOwner(user.is_owner);
      }
    };
    updateComponent();
  }, [useUser]);

  const handleSetVisible = (routeNames: string[]): void => {
    const curRoutes = routes.filter((r) => routeNames.includes(r.name));
    if (isAdmin) {
      curRoutes.push(routes.find((r) => r.name === 'user-admin'));
      curRoutes.push(routes.find((r) => r.name === 'animal-access'));
      curRoutes.push(routes.find((r) => r.name === 'handle-permission-request'));
    }
    if (isOwner /* && !isAdmin */) {
      curRoutes.push(routes.find((r) => r.name === 'owner-access'));
    }
    setVisibleRoutes(curRoutes);
  };

  useEffect(() => {
    switch (location.pathname) {
      case '/animals':
      case '/devices':
      case '/import':
      case '/owner-access':
      case '/profile':
      case '/handle-permission-request':
      case '/animal-access':
      case '/user-admin':
      case '/codes':
        handleSetVisible(['animals', 'devices', 'import', 'animal_access', 'profile', 'codes']);
        return;
    }
  }, [location, isAdmin, isOwner]); // only fire when these states change

  const routesToShow: RouteKey[] = Object.values(visibleRoutes.sort((a, b) => a.sort - b.sort));
  return (
    <Box className={'sidebar'} id="manage_sidebar" py={2} px={2}>

      <List component='nav' color="primary">
        {routesToShow
          .filter((r) => r.name !== 'notFound' && r.icon)
          .map((route: RouteKey, idx: number) => {
            return (
              <Tooltip key={idx} title={route.title}>
                <ListItem className="side-bar-item" button {...{ component: Link, to: route.path }}>
                  <ListItemIcon>
                    <Icon icon={route.icon} />
                  </ListItemIcon>
                  <ListItemText className={'list-item-txt'} primary={route.title} />
                </ListItem>
              </Tooltip>
            );
          })}
      </List>
      {/* <div>{sidebarContent}</div> */}
    </Box>
  );
}
