// Everthing is encapsulated into its own CLOSURE for privacy protection.
// Only expose (return) necessary functions to public for communications between
// modules.

// BUDGET related controller
var budgetController = (function () {
  var Income = function (id, amount, description) {
    this.id = id;
    this.amount = amount;
    this.description = description;
  };
  var Expense = function (id, amount, description) {
    this.id = id;
    this.amount = amount;
    this.description = description;
  };
  var recordsAudit = function (type) {
    var t = 0;
    records.allRecords[type].forEach(function (item) {
      t += item.amount;
    });
    records.totals[type] = t;
    records.totals.budget = records.totals.inc - records.totals.exp;
    if (records.totals.inc > 0) {
      records.totals['percentage'] = Math.round((records.totals.exp / records.totals.inc) * 100);
    }
  };
  var records = {
    allRecords: {
      inc: [],
      exp: []
    },
    totals: {
      inc: 0,
      exp: 0,
      budget: 0,
      percentage: 'N/A'
    }
  };
  return {
    addRecord: function (record) {
      var records_of_type, id, newRecord;
      records_of_type = records.allRecords[record.type];
      if (records_of_type.length > 0) {
        id = records_of_type[records_of_type.length - 1].id + 1;
      } else {
        id = 0;
      }
      if (record.type === 'inc') {
        newRecord = new Income(id, record.amount, record.description);
      } else if (record.type === 'exp') {
        newRecord = new Expense(id, record.amount, record.description);
      }
      records_of_type.push(newRecord);
      recordsAudit(record.type);
      return newRecord;
    },
    currentBudget: function () {
      return {
        // Do not return original object directly, to prevent it from being
        // modified accidentally
        budget: records.totals.budget,
        totalInc: records.totals.inc,
        totalExp: records.totals.exp,
        percentage: records.totals.percentage
      };
    },
    test: function () {
      return records;
    }
  };
})();

// UI related controller
var UIController = (function () {
  var uiDOM = {
    button_addItem: document.querySelector('.add__btn'),
    input_type: document.querySelector('.add__type'),
    input_amount: document.querySelector('.add__value'),
    input_description: document.querySelector('.add__description'),
    list_income: document.querySelector('.income__list'),
    list_expense: document.querySelector('.expenses__list'),
    budget_budget: document.querySelector('.budget__value'),
    budget_income: document.querySelector('.budget__income--value'),
    budget_expenses: document.querySelector('.budget__expenses--value'),
    budget_percentage: document.querySelector('.budget__expenses--percentage')
  };

  return {
    getUIDOM: function () {
      return uiDOM;
    },
    clearInput: function () {
      uiDOM.input_type.value = 'inc';
      uiDOM.input_amount.value = '';
      uiDOM.input_description.value = '';
      uiDOM.input_description.focus();
    },
    readInput: function () {
      var input = {
        type: uiDOM.input_type.value, // 'inc' or 'exp'
        amount: Math.abs(Number(uiDOM.input_amount.value)),
        description: uiDOM.input_description.value
      };
      if (input.description.replace(/\s/g, '').length === 0 || input.amount === 0) {
        alert('Input correct data please.');
        input = undefined;
      } else {
        this.clearInput();
      }
      return input;
    },
    addListItem: function (record, type) {
      var typePrefix, sign, percentage, percentageHTML, html;
      if (type === 'inc') {
        typePrefix = 'income';
        sign = '+';
        percentageHTML = '';
      } else if (type === 'exp') {
        typePrefix = 'expense';
        sign = '-';
        percentage = 0;
        percentageHTML = `<div class="item__percentage">21%</div>`;
      }
      html = `
        <div class="item clearfix" id="${typePrefix}-${record.id}">
          <div class="item__description">${record.description}</div>
            <div class="right clearfix">
              <div class="item__value">${sign} ${String(record.amount)}</div>
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
        </div>
      `;
      uiDOM['list_' + typePrefix].insertAdjacentHTML('beforeend', html);
    },
    updateBudget: function (budget) {
      var sign;
      sign = budget.budget >= 0 ? '+ ' : '- ';
      uiDOM.budget_budget.textContent = sign + String(Math.abs(budget.budget));
      uiDOM.budget_income.textContent = '+ ' + String(budget.totalInc);
      uiDOM.budget_expenses.textContent = '- ' + String(budget.totalExp);
      uiDOM.budget_percentage.textContent = String(budget.percentage) + '%';
    }
  };
})();

// Main App controller
var mainController = (function (budgetCtrl, UICtrl) {
  var registerEventListeners = function () {
    var uiDOM = UICtrl.getUIDOM();
    // EVENTS REGISTRATIONS
    uiDOM.button_addItem.addEventListener('click', ctrlAddRecord);
    document.addEventListener('keyup', function (e) {
      if (e.keycode === 13 || e.which === 13) {
        // keycode 13 for the ENTER key
        // older browsers implement 'which' property instead of 'keycode'
        ctrlAddRecord();
      } else if (e.keycode === 27 || e.which === 27) {
        // keycode 27 for the ESC key
        // reset inputs
        UICtrl.clearInput();
      }
    });
  };

  var ctrlAddRecord = function () {
    var input, newRecord;
    // get input data
    input = UICtrl.readInput();
    if (input !== undefined) {
      // Add new record to records
      newRecord = budgetController.addRecord(input);
      // Update UI: Add new list item
      UICtrl.addListItem(newRecord, input.type);
      // Update UI: update balance (budget)
      UICtrl.updateBudget(budgetCtrl.currentBudget());
    }
  };

  return {
    init: function () {
      registerEventListeners();
      UICtrl.updateBudget(budgetCtrl.currentBudget());
      UICtrl.clearInput();
    }
  };
})(budgetController, UIController);

mainController.init();
