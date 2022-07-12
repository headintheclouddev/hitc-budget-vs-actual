/**
 * @NScriptName HITC Budget vs Actual Workbook
 * @NScriptType WorkbookBuilderPlugin
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/dataset", "N/datasetLink", "N/workbook"], function (require, exports, dataset, datasetLink, workbook) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createWorkbook = void 0;
    function createWorkbook(context) {
        const budgetDataset = dataset.load({ id: 'customscript_hitc_budget_dataset' });
        const actualDataset = dataset.load({ id: 'customscript_hitc_actuals_dataset' });
        const budgetDepartment = budgetDataset.getExpressionFromColumn({ alias: 'Department' });
        const expenseDepartment = actualDataset.getExpressionFromColumn({ alias: 'Department' });
        const budgetPeriod = budgetDataset.getExpressionFromColumn({ alias: 'Period' });
        const expensePeriod = actualDataset.getExpressionFromColumn({ alias: 'Period' });
        const linkedDataset = datasetLink.create({
            datasets: [budgetDataset, actualDataset],
            expressions: [[budgetDepartment, expenseDepartment], [budgetPeriod, expensePeriod]],
            id: 'custdataset_hitc_budget_actual_link'
        });
        const dimensionItem = workbook.createDataDimensionItem({ expression: budgetPeriod });
        const periodDimension = workbook.createDataDimension({ items: [dimensionItem] });
        const periodSection = workbook.createSection({ children: [periodDimension] });
        const budgetAmtExpress = budgetDataset.getExpressionFromColumn({ alias: 'Amount' });
        const budgetSumTotal = workbook.createDataMeasure({ expression: budgetAmtExpress, aggregation: 'SUM', label: 'Budget' });
        const actualAmountExp = actualDataset.getExpressionFromColumn({ alias: 'Amount' });
        const expensesTotal = workbook.createDataMeasure({ expression: actualAmountExp, aggregation: 'SUM', label: 'Expenses' });
        const budgetMeasureExp = workbook.createExpression({ functionId: workbook.ExpressionType.MEASURE_VALUE, parameters: { measure: budgetSumTotal } });
        const expenseMeasureExp = workbook.createExpression({ functionId: workbook.ExpressionType.MEASURE_VALUE, parameters: { measure: expensesTotal } });
        const varianceExpress = workbook.createExpression({ functionId: workbook.ExpressionType.MINUS, parameters: { operand1: budgetMeasureExp, operand2: expenseMeasureExp } });
        const varianceMeasure = workbook.createCalculatedMeasure({ label: 'Variance', expression: varianceExpress });
        const columnSection = workbook.createSection({ children: [budgetSumTotal, expensesTotal, varianceMeasure] });
        const pivotTable = workbook.createPivot({
            id: 'hitc_budget_vs_actual_pivot',
            name: 'HITC Budget Vs Actual (SDF)',
            datasetLink: linkedDataset,
            rowAxis: workbook.createPivotAxis({ root: periodSection }),
            columnAxis: workbook.createPivotAxis({ root: columnSection })
        });
        context.workbook = workbook.create({ name: 'HITC Budget Vs Actual', pivots: [pivotTable] });
    }
    exports.createWorkbook = createWorkbook;
});
