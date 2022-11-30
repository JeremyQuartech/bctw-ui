import { Box, Tab, Tabs, useTheme } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import { BR } from 'themes/appTheme';

// export const isTab = <T,>(tab: T, currentTab: T): boolean => tab === currentTab;

interface PageTabsProps {
  tabLabels: string[];
  //handleTab: (tabIdx: number) => void;
  //tab: number;
  children?: JSX.Element[] | JSX.Element;
}
/**
 * @param tabList Array of tab names
 * @param tab Current selected tab index
 * @param handleTab Sets the tab index
 * @param children Html elements to render
 */
export const PageTabs = ({ tabLabels, children }: PageTabsProps): JSX.Element => {
  const [tab, setTab] = useState(0);
  const theme = useTheme();
  const firstTab = tab === 0;
  const tabIsSelected = (t: number): boolean => tab === t;
  return (
    //ml: -1 / mt: -1 is to prevent clipping issues with the boxShadow
    <Box width='100%' sx={{ ml: -1, mt: -1 }}>
      <Tabs
        value={tab}
        sx={{
          '& .MuiTabs-indicator': {
            display: 'none'
          }
        }}>
        {tabLabels.map((t, i) => (
          <Tab
            key={`tab-${i}`}
            label={t}
            onClick={() => setTab(i)}
            sx={{
              //Using inline styling to simplify issues with boxShadow not available in makeStyles.
              boxShadow: tabIsSelected(i) ? 1 : 0,
              backgroundColor: tabIsSelected(i) && theme.palette.background.paper,
              //BR is same value paper override uses for borderRadius in appTheme
              borderRadius: `8px 8px 0px 0px`,
              ml: 1,
              mt: 1
            }}
          />
        ))}
      </Tabs>
      <Box
        p={2}
        sx={{
          boxShadow: 1,
          ml: 1,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: firstTab ? `0px 8px 8px 8px` : `8px 8px 8px 8px`
        }}>
        {React.cloneElement(children[tab], { title: tabLabels[tab] })}
      </Box>
    </Box>
  );
};
