import { Button, Container } from '@mui/material';
import Box from '@mui/material/Box';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { CritterStrings } from 'constants/strings';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import ManageLayout from 'pages/layouts/ManageLayout';
import { useContext, useEffect, useState } from 'react';
import { UserAnimalAccess } from './UserAnimalAccess';
import { NotificationBanner } from 'components/alerts/Banner';
import { QuickSummary } from 'components/common/QuickSummary';
import { DataRetrievalDataTable } from '../collars/DataRetrievalDataTable';
import { CritterDataTables } from './CritterDataTables';
import { AlertContext } from 'contexts/UserAlertContext';
import { FormatAlert } from 'components/alerts/FormatAlert';
import { TelemetryAlert } from 'types/alert';
import dayjs from 'dayjs';
import AlertActions from 'components/alerts/AlertActions';
import { AlertBanner } from 'components/alerts/AlertBanner';

export default function CritterPage(): JSX.Element {
  const useAlert = useContext(AlertContext);
  const [showDataRetrieval, setShowDataRetrieval] = useState(false);
  const [openManageAnimals, setOpenManageAnimals] = useState(false);

  const [alerts, setAlerts] = useState<TelemetryAlert[]>([]);
  const inverseManageModal = (): void => {
    setOpenManageAnimals((a) => !a);
  };
  const inverseDataRetrieval = (): void => {
    setShowDataRetrieval((d) => !d);
  };
  useEffect(() => {
    if (useAlert?.alerts?.length) {
      //Set only the valid (null valid_to) alerts where snoozed_to date < today
      const nonSnoozedValidAlerts = useAlert.alerts.filter(
        (a) => !a.valid_to.isValid() && !(dayjs(a.snoozed_to).diff(dayjs()) > 0)
      );
      setAlerts(nonSnoozedValidAlerts);
    }
  }, [useAlert]);
  return (
    <ManageLayout>
      <SpeciesProvider>
        <Box className='manage-layout-titlebar'>
          <h1>{CritterStrings.title}</h1>
          <Box display='flex' alignItems='center'>
            <Button size='medium' variant='outlined' onClick={inverseManageModal}>
              {CritterStrings.manageMyAnimals}
            </Button>
            <FullScreenDialog open={openManageAnimals} handleClose={inverseManageModal}>
              <Container maxWidth='xl'>
                <h1>{CritterStrings.manageMyAnimals}</h1>
                <UserAnimalAccess />
              </Container>
            </FullScreenDialog>
          </Box>
        </Box>
        <AlertBanner />
        <QuickSummary handleDetails={inverseDataRetrieval} showDetails={showDataRetrieval} />
        <Box style={!showDataRetrieval ? {} : { display: 'none' }} mt={4}>
          <CritterDataTables />
        </Box>
        <Box style={showDataRetrieval ? {} : { display: 'none' }}>
          <DataRetrievalDataTable />
        </Box>
      </SpeciesProvider>
    </ManageLayout>
  );
}
