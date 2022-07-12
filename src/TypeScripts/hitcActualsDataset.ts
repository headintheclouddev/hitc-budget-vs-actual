/**
 * @NScriptName HITC Actuals Dataset
 * @NScriptType DataSetBuilderPlugin
 * @NApiVersion 2.1
 */

import {EntryPoints} from "N/types";
import dataset = require('N/dataset');
import query = require('N/query');

export function createDataset(context: EntryPoints.Plugins.DatasetBuilder.createDatasetContext) {
  const lineJoin = dataset.createJoin({ fieldId: 'transactionlines' });
  const typeColumn = dataset.createColumn({ fieldId: 'type' });
  const dateColumn = dataset.createColumn({ fieldId: 'trandate' });
  const itemColumn = dataset.createColumn({ fieldId: 'item', join: lineJoin });
  const typeCondition = dataset.createCondition({ column: typeColumn, operator: query.Operator.ANY_OF, values: ['VendBill'] });
  const dateCondition = dataset.createCondition({
    column: dateColumn,
    operator: query.Operator.WITHIN,
    values: [{ type: 'start', dateId: 'TY' }, { type: 'end', dateId: 'TY' }]
  });
  const itemCondition = dataset.createCondition({ column: itemColumn, operator: query.Operator.ANY_OF_NOT, values: [null] });
  context.dataset = dataset.create({
    type: 'transaction',
    name: 'HITC Actuals (SDF)',
    condition: dataset.createCondition({ operator: 'AND', children: [typeCondition, dateCondition, itemCondition] }),
    columns: [
      dateColumn,
      dataset.createColumn({ fieldId: 'entity' }),
      dataset.createColumn({ fieldId: 'trandisplayname' }),
      typeColumn,
      itemColumn,
      dataset.createColumn({ fieldId: 'department', join: lineJoin, alias: 'Department' }),
      dataset.createColumn({ fieldId: 'postingperiod', alias: 'Period' }),
      dataset.createColumn({ formula: 'ABS(TO_NUMBER({transactionlines.foreignamount}))', label: 'Amount', type: 'FLOAT', alias: 'Amount' })
    ]
  });
}
