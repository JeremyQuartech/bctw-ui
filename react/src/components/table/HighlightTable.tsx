import { darken, lighten, Table, TableBody, TableCell, TableRow, useTheme } from '@mui/material';
import TableContainer from 'components/table/TableContainer';
import { formatTableCell, getComparator, stableSort } from 'components/table/table_helpers';
import { PlainTableProps, Order } from 'components/table/table_interfaces';
import TableHead from 'components/table/TableHead';
import { useState } from 'react';
import { BCTWBase } from 'types/common_types';
import makeStyles from '@mui/styles/makeStyles';
import { Tooltip } from 'components/common';
/**
 * A table that expects the data to be provided.
 */
export type HighlightTableProps<T> = PlainTableProps<T> & {
  data: T[];
  rowIdentifier: string;
  messages: any[];
  onSelectCell: (row_idx: number, cellname: string) => void;
  dimFirstColumn: boolean;
  secondaryHeaders: string[];
  warningRows?: number[];
};

const useStyles = makeStyles((theme) => ({
  badCell: {
    backgroundColor: lighten(theme.palette.error.light, 0.9),
    borderLeft: '1px solid white',
    borderRight: '1px solid white'
  }
}));

export default function HighlightTable<T extends BCTWBase<T>>({
  headers,
  data,
  onSelectCell,
  messages,
  secondaryHeaders,
  dimFirstColumn = false,
  warningRows
}: HighlightTableProps<T>): JSX.Element {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof T>();
  const style = useStyles();

  const handleSort = (event: React.MouseEvent<unknown>, property: keyof T): void => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleClickCell = (row_idx: any, cellname: any): void => {
    if (typeof onSelectCell === 'function' && data?.length) {
      onSelectCell(row_idx, cellname);
    }
  };
  return (
    <TableContainer>
      <Table className={'table'} size='small'>
        {data === undefined ? null : (
          <TableHead
            headersToDisplay={headers}
            headerData={data && data[0]}
            secondaryHeaders={secondaryHeaders}
            isMultiSelect={false}
            numSelected={0}
            order={order}
            orderBy={(orderBy as string) ?? ''}
            onRequestSort={handleSort}
            onSelectAllClick={null}
            rowCount={data?.length ?? 0}
            customHeaders={undefined}
            hiddenHeaders={dimFirstColumn ? [headers[0]] : []}
          />
        )}
        <TableBody>
          {stableSort(data, getComparator(order, orderBy)).map((obj: T, prop: number) => {
            return (
              <TableRow
                hover
                role='checkbox'
                tabIndex={-1}
                key={`row${prop}`}
                selected={warningRows.includes(prop)}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: lighten(theme.palette.warning.light, 0.9),
                    color: '#ffffff'
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: lighten(theme.palette.warning.main, 0.9)
                  }
                }}>
                {headers.map((k, i) => {
                  if (!k) {
                    return null;
                  }
                  const { value } = formatTableCell(obj, k);
                  const isMessage = messages.length ? messages[prop][k] !== undefined : false;
                  return (
                    <>
                      {isMessage ? (
                        <TableCell
                          onClick={() => handleClickCell(prop, k)}
                          className={style.badCell}
                          key={`${String(k)}${i}`}
                          align={'left'}>
                          <Tooltip title={messages[prop][k]}>
                            <>{value}</>
                          </Tooltip>
                        </TableCell>
                      ) : (
                        <TableCell
                          onClick={() => handleClickCell(prop, k)}
                          className={dimFirstColumn && i == 0 ? 'dimmed-cell' : undefined}
                          key={`${String(k)}${i}`}
                          align={'left'}>
                          {value}
                        </TableCell>
                      )}
                    </>
                  );
                })}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
