import { Box, Grid, Link, Theme, Typography, CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import GovLinkBox from 'components/common/GovLinkBox';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { useEffect } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  callout: {
    padding: '25px',
    borderLeft: `10px solid ${theme.palette.primary.main}`,
    margin: '16px 0',
    backgroundColor: '#f2f2f2'
  },
}));

const Home = (): JSX.Element => {
  const styles = useStyles();
  const api = useTelemetryApi();
  const { data, status, isLoading } = api.useCodeDesc('HOME_HDR');
  console.log(data)
  const cards = {
    welcome: `Wwwwwelcome to the BC Telemetry Warehouse (BCTW). The BCTW is an application and database to manage and store the
            Province of British Columbia’s wildlife telemetry observations to support informed management decisions and
            improve conservation efforts.`,
    support: {
      title: 'Need Support?',
      data: [
        {
          textPrefix: 'For support, please contact ',
          link: 'bctw@gov.bc.ca',
          href: 'mailto:bctw@gov.bc.ca'
        }
      ]
    },
    resources: {
      title: 'Other Resources',
      data: [
        {
          textPrefix: 'Search for ',
          link: 'wildlife data and information',
          href: 'https://www.gov.bc.ca/wildlife-species-information'
        },
        {
          textPrefix: 'Use the ',
          textSuffix:
            ' to access publicly available telemetry data layers derived from the BC Telemetry Warehouse and Wildlife Species Inventory (SPI) database for desktop GIS analyses.',
          link: 'DataBC Data Catalogue',
          href: 'https://catalogue.data.gov.bc.ca/dataset?q=wsi&download_audience=Public&sort=score+desc%2C+record_publish_date+desc'
        }
      ]
    }
  };
  const { welcome, support, resources } = cards;
  return (
    <div className='container'>
        <Typography variant='h2' style={{ fontWeight: 'bold' }}>
        BC Telemetry Warehouse
      </Typography>
      {data && <Typography paragraph className={styles.callout} children={data}/>}
      <Grid container spacing={2} flexDirection='column' wrap='nowrap' alignItems='flex-end'>
        <Grid item xl={2} lg={3} xs={12} md={4}>
          <GovLinkBox title={resources.title} data={resources.data}/>
        </Grid>
          <Grid item xl={2} lg={3} xs={12} md={4}>
          <GovLinkBox title={support.title} data={support.data} />
        </Grid>
      </Grid>
    </div>
  );
};
export default Home;
