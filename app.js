// Everthing is encapsulated into its own CLOSURE for privacy protection.
// Only expose (return) necessary functions to public for communications between
// modules.

// BUDGET related controller
var budgetController = (function () {
  // main data structure
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
  Expense.prototype.percentageStr = function (totalIncome) {
    var p;
    if (totalIncome > 0) {
      p = (Math.abs(this.amount / totalIncome) * 100).toFixed() + '%';
    } else {
      p = 'N/A';
    }
    return p;
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
  1;

  // recalculate totals
  var recordsAudit = function (type) {
    if (type === 'inc' || type === 'exp') {
      var t = 0;
      records.allRecords[type].forEach(function (item) {
        t += item.amount;
      });
      records.totals[type] = t;
      records.totals.budget = records.totals.inc + records.totals.exp;
      if (records.totals.inc > 0) {
        records.totals['percentage'] = Math.round(Math.abs(records.totals.exp / records.totals.inc) * 100);
      }
    }
  };

  // expose methods and data as needed
  return {
    // add a new record
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
    // remove a record
    removeRecord: function (type, id) {
      records.allRecords[type] = records.allRecords[type].filter(function (record) {
        return record.id !== id;
      });
      recordsAudit(type);
    },
    // current totals
    currentBudget: function () {
      return {
        // Do not return original object directly, to prevent it from being
        // modified accidentally
        budget: records.totals.budget,
        totalInc: records.totals.inc,
        totalExp: records.totals.exp,
        percentage: records.totals.percentage,
        expList: records.allRecords.exp
      };
    }
  };
})();

// UI related controller
var UIController = (function () {
  // DOMs to be manipulated
  var uiDOM = {
    button_addItem: document.querySelector('.add__btn'),
    input_type: document.querySelector('.add__type'),
    input_amount: document.querySelector('.add__value'),
    input_description: document.querySelector('.add__description'),
    list_inc: document.querySelector('.income__list'),
    list_exp: document.querySelector('.expenses__list'),
    budget_budget: document.querySelector('.budget__value'),
    budget_income: document.querySelector('.budget__income--value'),
    budget_expenses: document.querySelector('.budget__expenses--value'),
    budget_percentage: document.querySelector('.budget__expenses--percentage'),
    listsContainer: document.querySelector('.container'),
    label_date: document.querySelector('.budget__title--month')
  };
  var sepNumber = function (num, sep, sepPos) {
    if (sep === undefined) sep = ',';
    if (sepPos === undefined) sepPos = 3;
    if (typeof num === 'number') num = num.toFixed(2);
    var numParts, intParts, digits, mod;
    numParts = num.toString().split('.');
    digits = numParts[0].length;
    mod = digits % sepPos;
    intParts = mod === 0 ? [] : [numParts[0].substr(0, mod)];
    for (var i = 0; i < Math.floor(digits / sepPos); i++) {
      intParts.push(numParts[0].substr(i * sepPos + mod, sepPos));
    }
    numParts.shift();
    numParts.unshift(intParts.join(sep));
    return numParts.join('.');
  };
  var formatNumber = function (num) {
    var sign, intPart, decPart, digits, pos, mod, intPartNew;
    if (num > 0) {
      sign = '+ ';
    } else if (num === 0) {
      sign = '';
    } else {
      sign = '- ';
    }
    num = sepNumber(Math.abs(num));
    return sign + ' ' + num;
  };
  // expose methods for UI manipulation
  return {
    getUIDOM: function () {
      return uiDOM;
    },
    // reset input fields
    clearInput: function () {
      uiDOM.input_type.value = 'inc';
      uiDOM.input_amount.value = '';
      uiDOM.input_description.value = '';
      uiDOM.input_description.focus();
    },
    // read in raw input and sanitize them as needed
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
      if (input.type === 'exp') input.amount *= -1;
      return input;
    },
    // add a new item to the list it belongs to
    addListItem: function (record, type) {
      var percentageHTML, html;
      if (type === 'inc') {
        percentageHTML = '';
      } else if (type === 'exp') {
        percentageHTML = `<div class="item__percentage"></div>`;
      }
      html = `
        <div class="item clearfix" id="${type}-${record.id}">
          <div class="item__description">${record.description}</div>
            <div class="right clearfix">
              <div class="item__value">${formatNumber(record.amount)}</div>
              ${percentageHTML}
              <div class="item__delete">
                <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
        </div>
      `;
      uiDOM['list_' + type].insertAdjacentHTML('beforeend', html);
    },
    // remove an item from the list
    removeListItem: function (itemBlock) {
      itemBlock.remove();
    },
    // update the main budget area
    updateBudget: function (budget) {
      uiDOM.budget_budget.textContent = formatNumber(budget.budget);
      uiDOM.budget_income.textContent = formatNumber(budget.totalInc);
      uiDOM.budget_expenses.textContent = formatNumber(budget.totalExp);
      uiDOM.budget_percentage.textContent =
        budget.percentage === 'N/A' ? budget.percentage : budget.percentage.toString() + '%';
      // for each expense item's percentage
      budget.expList.forEach(function (expRecord) {
        var pSelector = '#exp-' + expRecord.id.toString() + ' .item__percentage';
        document.querySelector(pSelector).innerHTML = expRecord.percentageStr(budget.totalInc);
      });
    },
    updateDate: function () {
      var now, year, month;
      now = new Date();
      year = now.getFullYear();
      month = now.getMonth();
      month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month];
      uiDOM.label_date.innerHTML = '<strong>' + month + '</strong>' + ', ' + year.toString();
    },
    addUIHint: function () {
      uiDOM.input_type.classList.toggle('red-focus');
      uiDOM.input_description.classList.toggle('red-focus');
      uiDOM.input_amount.classList.toggle('red-focus');
      uiDOM.button_addItem.classList.toggle('red');
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
    uiDOM.listsContainer.addEventListener('click', ctrlRemoveRecord);
    uiDOM.input_type.addEventListener('change', UICtrl.addUIHint);
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

  var ctrlRemoveRecord = function (e) {
    // ultilizing event delegation (bubbling)
    // https://www.w3.org/TR/DOM-Level-3-Events/#event-flow
    // https://www.quirksmode.org/js/events_order.html#link4
    var clicked = e.target; // the actual element that was clicked
    if (clicked.matches('i.ion-ios-close-outline')) {
      // only handle when the delete button was clicked
      var itemBlock = clicked.closest('.item.clearfix');
      var type = itemBlock.id.split('-')[0];
      var id = Number(itemBlock.id.split('-')[1]);
      budgetCtrl.removeRecord(type, id);
      UICtrl.removeListItem(itemBlock);
      UICtrl.updateBudget(budgetCtrl.currentBudget());
    }
  };

  return {
    init: function () {
      UICtrl.updateDate();
      registerEventListeners();
      UICtrl.updateBudget(budgetCtrl.currentBudget());
      UICtrl.clearInput();
    }
  };
})(budgetController, UIController);

mainController.init();
