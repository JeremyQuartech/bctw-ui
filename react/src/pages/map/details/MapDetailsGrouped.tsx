import { ITelemetryDetail, IUniqueFeature, TelemetryDetail } from 'types/map';
import { Checkbox, TableRow, TableCell, TableBody, Table, TableContainer, Paper } from '@material-ui/core';
import { getComparator } from 'components/table/table_helpers';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { Order } from 'components/table/table_interfaces';
import { plainToClass } from 'class-transformer';
import { flattenUniqueFeatureIDs, sortGroupedFeatures } from 'pages/map/map_helpers';
import { MapDetailsBaseProps } from './MapDetails';

export type MapDetailsGroupedProps = MapDetailsBaseProps & {
  features: IUniqueFeature[];
  crittersSelected: string[];
};

type GroupedCheckedStatus = {
  critter_id: string;
  checked: boolean;
};

const rows_to_render = ['animal_id', 'wlh_id', 'device_id', 'frequency', 'Map Points'];

export default function MapDetailsGrouped(props: MapDetailsGroupedProps): JSX.Element {
  const { features, crittersSelected, handleShowOverview, handleHoverCritter } = props;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<string>('Critter Name');
  const [checkedGroups, setCheckedGroups] = useState<string[]>([]);

  const handleSort = (event: React.MouseEvent<unknown>, property: string): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    const newChecked = val ? features.map((f) => f.critter_id) : [];
    pushRowCheck(newChecked);
  };

  const handleRowCheck = (v: GroupedCheckedStatus): void => {
    // todo: cleanup
    let newChecked = null;
    const idxFound = checkedGroups.indexOf(v.critter_id);
    if (idxFound === -1) {
      newChecked = [...checkedGroups, v.critter_id];
    } else {
      const cp = [...checkedGroups];
      cp.splice(idxFound, idxFound + 1);
      if (v.checked) {
        cp.push(v.critter_id);
      }
      newChecked = cp;
    }
    pushRowCheck(newChecked);
  };

  const pushRowCheck = (ids: string[]): void => {
    setCheckedGroups(ids);
    const pointIDs = flattenUniqueFeatureIDs(features.filter((f) => ids.includes(f.critter_id)));
    handleHoverCritter(pointIDs);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        {features && features.length ? (
          <TableHead
            headersToDisplay={rows_to_render}
            headerData={plainToClass(TelemetryDetail, features[0].features[0].properties) as TelemetryDetail}
            numSelected={checkedGroups.length}
            order={order}
            orderBy={orderBy ?? ''}
            onRequestSort={handleSort}
            rowCount={features.length}
            isMultiSelect={true}
            onSelectAllClick={handleSelectAllClick}
            customHeaders={[]}
          />
        ) : null}
        <TableBody>
          {sortGroupedFeatures(features, getComparator(order, orderBy)).map((u) => {
            return (
              <Row
                key={u.critter_id}
                pointIDs={u.features.map((f) => f.id)}
                isChecked={checkedGroups.includes(u.critter_id)}
                isSelectedInMap={crittersSelected.indexOf(u.critter_id) !== -1}
                row={u.features[0].properties}
                handleShowOverview={handleShowOverview}
                handleRowCheck={handleRowCheck}
                handleHoverCritter={handleHoverCritter}
              />
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type IRowProps = MapDetailsBaseProps & {
  pointIDs: number[];
  isSelectedInMap: boolean;
  isChecked: boolean;
  row: ITelemetryDetail;
  handleRowCheck: (v: GroupedCheckedStatus) => void;
};

function Row(props: IRowProps): JSX.Element {
  const { row, handleRowCheck, handleShowOverview, isSelectedInMap, pointIDs, isChecked, handleHoverCritter } = props;

  const onCheck = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const val = event.target.checked;
    handleRowCheck({ critter_id: row.critter_id, checked: val });
  };

  return (
    <TableRow
      hover
      className={`map-bottom-panel-row ${isSelectedInMap ? 'bottom-panel-row-is-map-selected' : ''}`}
      // fixme: competing behavior with hover/ check row?
      // onMouseEnter={(): void => handleCritterHover(pointIDs)}
      // onMouseLeave={(): void => handleCritterHover([])}
    >
      <TableCell padding='checkbox'>
        <Checkbox onChange={onCheck} checked={isSelectedInMap || isChecked} />
      </TableCell>
      <TableCell>
        <div onClick={(): void => handleShowOverview('critter', row)} className={'critter-select'}>
          {row.animal_id ?? 'unknown'}
        </div>
      </TableCell>
      <TableCell>{row.wlh_id}</TableCell>
      <TableCell>
        <div onClick={(): void => handleShowOverview('collar', row)} className={'critter-select'}>
          {row.device_id}
        </div>
      </TableCell>
      <TableCell>{row.frequency}</TableCell>
      <TableCell>{pointIDs.length}</TableCell>
    </TableRow>
  );
}
