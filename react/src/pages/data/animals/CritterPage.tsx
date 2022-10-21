import Box from '@mui/material/Box';
import DataTable from 'components/table/DataTable';
import { BannerStrings, CritterStrings, CritterStrings as CS } from 'constants/strings';
import { RowSelectedProvider } from 'contexts/TableRowSelectContext';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import EditCritter from 'pages/data/animals/EditCritter';
import ExportViewer from 'pages/data/bulk/ExportImportViewer';
import ManageLayout from 'pages/layouts/ManageLayout';
import { MutableRefObject, Ref, useEffect, useRef, useState } from 'react';
import { Animal, AttachedAnimal } from 'types/animal';
import ModifyCritterWrapper from './ModifyCritterWrapper';
import { QueryStatus } from 'react-query';
import { doNothing, doNothingAsync } from 'utils/common_helpers';
import { SpeciesProvider } from 'contexts/SpeciesContext';
import Icon from 'components/common/Icon';
import { Alert, Button, Container, IconButton, Menu, MenuItem, Select, TableCell } from '@mui/material';
import { buttonProps } from 'components/component_constants';
import { attachedAnimalNotification } from 'constants/formatted_string_components';
import FullScreenDialog from 'components/modal/DialogFullScreen';
import { UserCritterAccess } from 'types/animal_access';
import { ITableQueryProps } from 'components/table/table_interfaces';
import UserProfile from 'pages/user/UserProfile';
import { UserAnimalAccess } from './UserAnimalAccess';
import { AttachedCollar } from 'types/collar';

import { ErrorBanner, InfoBanner, NotificationBanner, SuccessBanner } from 'components/common/Banner';
import { InfoCard } from 'components/common/InfoCard';
import { QuickSummary } from 'components/common/QuickSummary';
import { ActionsMenu } from 'components/common/partials/ActionsMenu';
import AddEditViewer from '../common/AddEditViewer';
import { useHistory } from 'react-router-dom';
import AssignmentHistory from './AssignmentHistory';
import { WorkflowType } from 'types/events/event';
import { CritterWorkflow } from '../events/CritterWorkflow';
import PerformAssignmentAction from './PerformAssignmentAction';
import { CollarHistory } from 'types/collar_history';
export default function CritterPage(): JSX.Element {
  const api = useTelemetryApi();
  const [editObj, setEditObj] = useState<Animal | AttachedAnimal>({} as Animal);
  const [deleted, setDeleted] = useState('');
  const [updated, setUpdated] = useState('');
  const [workflowType, setWorkflowType] = useState<WorkflowType>();

  // Modal Open States
  const [openManageAnimals, setOpenManageAnimals] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAssignment, setOpenAssignment] = useState(false);
  const [openWorkflow, setOpenWorkflow] = useState(false);
  const [openAttach, setOpenAttach] = useState(false);

  const handleSelect = <T extends Animal>(row: T): void => setEditObj(row);

  const inverseManageModal = (): void => {
    setOpenManageAnimals((a) => !a);
  };
  // props to be passed to the edit modal component most props are overwritten in {ModifyCritterWrappper}
  const editProps = {
    editing: null,
    open: false,
    onSave: doNothingAsync,
    handleClose: doNothing,
    workflow: workflowType
  };

  const addEditProps = {
    editing: null,
    empty: new AttachedAnimal(),
    addTooltip: CS.addTooltip,
    queryStatus: 'idle' as QueryStatus,
    disableEdit: true,
    disableDelete: true,
    modalControl: true
  };

  const Menu = (row: AttachedAnimal, idx: number): JSX.Element => {
    const history = useHistory();
    const { edit, map, attach, mortality, removeCollar } = CritterStrings.menuItems;
    const _edit = () => setOpenEdit(true);
    const _map = () => history.push('/map');
    const _remove = () => setOpenAssignment(true);
    const _mortality = () => {
      setWorkflowType('mortality');
      setOpenWorkflow(true);
    };
    const _attach = () => {
      setOpenAttach(true);
    };
    const defaultItems = [
      {
        label: edit,
        icon: <Icon icon={'edit'} />,
        handleClick: _edit
      },
      {
        label: map,
        icon: <Icon icon={'location'} />,
        handleClick: _map
      }
    ];
    const animalItems = [
      {
        label: attach,
        icon: <Icon icon={'edit'} />,
        handleClick: _attach
      }
    ];
    const attachedItems = [
      {
        label: mortality,
        icon: <Icon icon={'dead'} />,
        handleClick: _mortality
      },
      {
        label: removeCollar,
        icon: <Icon icon={'delete'} />,
        handleClick: _remove
      }
    ];
    return (
      <ActionsMenu
        disabled={row !== editObj}
        menuItems={
          row instanceof AttachedAnimal ? [...defaultItems, ...attachedItems] : [...defaultItems, ...animalItems]
        }
      />
    );
  };
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
        <NotificationBanner hiddenContent={[]} />
        <Box mb={4}>
          <QuickSummary />
        </Box>
        {/* wrapped in RowSelectedProvider to only allow one selected row between tables */}
        <RowSelectedProvider>
          <>
            <Box mb={4}>
              <DataTable
                headers={AttachedAnimal.attachedCritterDisplayProps}
                queryProps={{ query: api.useAssignedCritters }}
                onSelect={handleSelect}
                deleted={deleted}
                updated={updated}
                title={CritterStrings.collaredAnimals}
                customColumns={[{ column: Menu, header: <b>Actions</b> }]}
                exporter={
                  <>
                    <ExportViewer<AttachedAnimal>
                      template={[
                        'critter_id',
                        'species',
                        'population_unit',
                        'wlh_id',
                        'animal_id',
                        'collar_id',
                        'device_id',
                        'frequency',
                        'animal_id',
                        'latitude',
                        'longitude'
                      ]}
                      eTitle={CritterStrings.exportTitle}
                    />
                  </>
                }
              />
            </Box>
            <Box mb={4}>
              <DataTable
                headers={new Animal().displayProps}
                //title={CS.unassignedTableTitle}
                queryProps={{ query: api.useUnassignedCritters }}
                onSelect={handleSelect}
                updated={updated}
                deleted={deleted}
                title={CritterStrings.collaredAnimals}
                customColumns={[{ column: Menu, header: <b>Actions</b> }]}
                exporter={
                  <>
                    {/* <ModifyCritterWrapper
                      editing={editObj}
                      onUpdate={(critter_id: string): void => setUpdated(critter_id)}
                      setCritter={setEditObj}>
                      <AddEditViewer<Animal> {...addEditProps}>
                        <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
                      </AddEditViewer>
                    </ModifyCritterWrapper> */}
                    <ExportViewer<Animal>
                      template={[
                        'critter_id',
                        'species',
                        'population_unit',
                        'wlh_id',
                        'animal_id',
                        'animal_id',
                        'animal_status'
                      ]}
                      eTitle={CritterStrings.exportTitle}
                    />
                  </>
                }
              />
            </Box>

            {/* Wrapper to allow editing of Attached and Unattached animals */}

            <ModifyCritterWrapper
              editing={editObj}
              onUpdate={(critter_id: string): void => setUpdated(critter_id)}
              setCritter={setEditObj}>
              <EditCritter {...editProps} open={openEdit} handleClose={() => setOpenEdit(false)} />
            </ModifyCritterWrapper>

            {/* Modal for assigning a device to a critter */}

            <AssignmentHistory
              open={openAssignment}
              handleClose={(): void => setOpenAssignment(false)}
              critter_id={editObj.critter_id}
              permission_type={editObj.permission_type}
            />
            {/* Modal for critter workflows */}

            <CritterWorkflow editing={editObj} workflow={workflowType} open={openWorkflow} setOpen={setOpenWorkflow} />

            <PerformAssignmentAction
              critter_id={editObj.critter_id}
              permission_type={editObj.permission_type}
              current_attachment={new CollarHistory()}
              openAttach={openAttach}
              setOpenAttach={setOpenAttach}
            />
          </>
        </RowSelectedProvider>
      </SpeciesProvider>
    </ManageLayout>
  );
}
