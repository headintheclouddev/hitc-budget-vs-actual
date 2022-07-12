/**
 * @NScriptType Suitelet
 * @NApiVersion 2.1
 */
define(["require", "exports", "N/log", "N/ui/serverWidget", "N/workbook"], function (require, exports, log, serverWidget, workbook) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.onRequest = void 0;
    function onRequest(context) {
        const form = serverWidget.createForm({ title: 'Budget Vs Actual' });
        const wb = workbook.load({ id: 'customscript_hitc_budget_v_actual_wb' });
        let html = `
    <style>
      #budget-vs-actual {
        border: thin solid black;
        border-collapse: collapse;
      }
      #budget-vs-actual th {
        font-weight: bold;
      }
      #budget-vs-actual th, #budget-vs-actual td {
        padding: 4px;
        border: thin solid black;
      }
      .number {
        text-align: right;
      }
    </style>
    <table id="budget-vs-actual">
      <tr><th>Period</th><th>Budget</th><th>Actual Expenses</th><th>Variance</th></tr>
  `;
        const intersections = wb.runPivot({ id: 'hitc_budget_vs_actual_pivot' });
        for (const intersection of intersections) {
            const row = intersection.row;
            if (!row.itemValues)
                continue;
            log.debug('intersection', intersection);
            const period = row.itemValues[0].value;
            let monthBudget = 0, monthExpenses = 0, variance = 0;
            for (const measureValue of intersection.measureValues) {
                if (measureValue.measure.label == 'Budget') {
                    const budget = measureValue.value;
                    monthBudget = budget.amount;
                }
                else if (measureValue.measure.label == 'Expenses') {
                    monthExpenses = measureValue.value;
                }
                else { // Variance
                    variance = measureValue.value.amount;
                }
            }
            html += `<tr><td>${period.name}</td><td class="number">${monthBudget}</td><td class="number">${monthExpenses}</td><td class="number">${variance}</td></tr>`;
        }
        html += '</table>';
        form.addField({ id: 'html', label: 'HTML', type: serverWidget.FieldType.INLINEHTML }).defaultValue = html;
        context.response.writePage({ pageObject: form });
    }
    exports.onRequest = onRequest;
});
