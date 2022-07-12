/**
 * @NScriptName HITC Budget Dataset
 * @NScriptType DataSetBuilderPlugin
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/dataset", "N/query"], function (require, exports, dataset, query) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createDataset = void 0;
    function createDataset(context) {
        const budgetLines = dataset.createJoin({ fieldId: 'budgetmachine' });
        context.dataset = dataset.create({
            type: 'budgets',
            name: 'HITC Budgets (SDF)',
            condition: dataset.createCondition({ column: dataset.createColumn({ fieldId: 'year' }), operator: query.Operator.ANY_OF, values: ['358'] }),
            columns: [
                dataset.createColumn({ fieldId: 'account', alias: 'Account' }),
                dataset.createColumn({ fieldId: 'department', alias: 'Department' }),
                dataset.createColumn({ fieldId: 'period', join: budgetLines, alias: 'Period' }),
                dataset.createColumn({ fieldId: 'amount', join: budgetLines, alias: 'Amount' })
            ]
        });
    }
    exports.createDataset = createDataset;
});
