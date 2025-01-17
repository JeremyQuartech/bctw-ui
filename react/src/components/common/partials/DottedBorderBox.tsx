import { Box, useTheme } from '@mui/material';
import React from 'react';

interface DottedBorderBoxProps {
  children?: JSX.Element;
}

export const DottedBorderBox = (props: DottedBorderBoxProps) => {
  const theme = useTheme();
  const { children } = props;
  return (
    <Box
      sx={{
        border: '2px dashed grey',
        backgroundColor: 'grey.100',
        minWidth: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '5rem'
      }}>
      {children}
    </Box>
  );
};
