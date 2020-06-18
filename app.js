// BUDGET related controller
var budgetController = (function () {
  //
})();

// UI related controller
var UIController = (function () {
  //
})();

// Main App controller
var mainController = (function (budgetCtrl, UICtrl) {
  var ctrlAddRecord = function () {
    // get input data
    var record = {
      type: document.querySelector(".add__type").value,
      amount: document.querySelector(".add__value").value,
      description: document.querySelector(".add__description").value
    };
    // insert list item into lists

    // 3. update budget
  };
  // EVENTS REGISTRATIONS
  document.querySelector(".add__btn").addEventListener("click", ctrlAddRecord);
  document.addEventListener("keyup", function (e) {
    if (e.keycode === 13 || e.which === 13) {
      // keycode 13 for the ENTER key
      // older browsers implement 'which' property instead of 'keycode'
      ctrlAddRecord();
    } else if (e.keycode === 27 || e.which === 27) {
      // keycode 27 for the ESC key
      // reset inputs
      document.querySelector(".add__type").value = "inc";
      document.querySelector(".add__value").value = "";
      document.querySelector(".add__description").value = "";
    }
  });
})(budgetController, UIController);
