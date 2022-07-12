/**
 * @NScriptType Suitelet
 * @NApiVersion 2.1
 */

import {EntryPoints} from "N/types";
import log = require('N/log');
import serverWidget = require('N/ui/serverWidget');
import workbook = require('N/workbook');

export function onRequest(context: EntryPoints.Suitelet.onRequestContext) {
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
    const row = intersection.row as workbook.DataDimensionValue;
    if (!row.itemValues) continue;
    log.debug('intersection', intersection);
    const period = row.itemValues[0].value as workbook.Record;
    let monthBudget = 0, monthExpenses = 0, variance = 0;
    for (const measureValue of intersection.measureValues) {
      if (measureValue.measure.label == 'Budget') {
        const budget = measureValue.value as workbook.Currency;
        monthBudget = budget.amount;
      } else if (measureValue.measure.label == 'Expenses') {
        monthExpenses = measureValue.value as number;
      } else { // Variance
        variance = (measureValue.value as workbook.Currency).amount;
      }
    }
    html += `<tr><td>${period.name}</td><td class="number">${monthBudget}</td><td class="number">${monthExpenses}</td><td class="number">${variance}</td></tr>`;
  }
  html += '</table>';
  form.addField({ id: 'html', label: 'HTML', type: serverWidget.FieldType.INLINEHTML }).defaultValue = html;
  context.response.writePage({ pageObject: form });
}
