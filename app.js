var budgetController = (function () {
  var Expenses = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expenses.prototype.calcPercentage = function (totalincome) {
    if (totalincome > 0) {
      this.percentage = Math.round((this.value / totalincome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expenses.prototype.getPercentage = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type) {
    var sum = 0;

    data.allItems[type].forEach(function (cur) {
      sum += cur.value; // value merupakan nama properti di obejk expenses or income
    });

    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function (type, description, value) {
      var ID, newItem;

      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1] + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, description, value);
      } else if (type === "exp") {
        newItem = new Expenses(ID, description, value);
      }

      data.allItems[type].push(newItem);
      return newItem;
    },

    deleteItem: function (type, id) {
      var ids, index;

      // Maps Untuk akses data di dlm array
      ids = data.allItems[type].map(function (current) {
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    calculateBudget: function () {
      // Calculate total income and expenses
      calculateTotal("exp");
      calculateTotal("inc");
      // Calculate the budget: income - exepenses
      data.budget = data.totals.inc - data.totals.exp;
      // Calculate the percentage of income we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      data.allItems.exp.forEach(function (curr) {
        curr.calcPercentage(data.totals.inc);
      });
    },

    getPercentages: function () {
      var allPerc = data.allItems.exp.map(function (curr) {
        return curr.getPercentage();
      });

      return allPerc;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      };
    },

    testing: function () {
      console.log(data);
    }
  };
})();

var UIController = (function () {
  var DOMstring = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    percentageLabel: ".budget__expenses--percentage",
    container: ".container",
    expensesPercLabel: ".item__percentage",
    dateLabel: '.budget__title--month'
  };

  var formatNumber = function (num, type) {

    var numSplit, int, dec, type;
    /*
    + or - format number
    exactly 2 descimal points
    comma separating the thousands

    2345.4564 -> + 2,345.45
    2000 -> 2,000.00
    23456
    */

    num = Math.abs(num);
    num = num.toFixed(2);
    numSplit = num.split('.');
    int = numSplit[0];
    if (int.length > 3) {
      int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 23546
      //output 23.546
    }
    dec = numSplit[1];

    // type === 'exp' ? sign = '-' : sign = '+';
    return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };


  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstring.inputType).value,
        description: document.querySelector(DOMstring.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstring.inputValue).value)
      };
    },

    addListItem: function (obj, type) {
      var html, element, newHtml;

      if (type === "inc") {
        element = DOMstring.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstring.expensesContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%description%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
    },

    deleteListItem: function (selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearField: function () {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        DOMstring.inputDescription + ", " + DOMstring.inputValue
      );
      fieldsArr = Array.prototype.slice.call(fields);
      fieldsArr.forEach(function (current, index, array) {
        current.value = "";
      });

      fieldsArr[0].focus();
    },

    displayBudget: function (obj) {

      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
      document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstring.expensesLabel).textContent =
        formatNumber(obj.totalExp, type);

      if (obj.percentage > 0) {
        document.querySelector(DOMstring.percentageLabel).textContent =
          obj.percentage + "%";
      } else {
        document.querySelector(DOMstring.percentageLabel).textContent = "---";
      }
    },

    displayPercentages: function (percentages) {
      fields = document.querySelectorAll(DOMstring.expensesPercLabel);
      nodeListForEach(fields, function (current, index) {
        if (percentages[index] > 0) {
          current.textContent = percentages[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },
    displayMonth: function () {
      var now, year, month;
      var now = new Date(); // Dec = 11, Jan = 12, Feb = 1()
      // var christmas = new Date(2019, 11, 25); // Format(yyyy, mm, dd);

      var monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Augst', 'September', 'October',
        'November', 'December'
      ];

      month = monthName[now.getMonth()];
      year = now.getFullYear();
      document.querySelector(DOMstring.dateLabel).textContent = month + ' ' + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(DOMstring.inputType + ',' + DOMstring.inputDescription + ',' + DOMstring.inputValue);
      nodeListForEach(fields, function (cur) {
        cur.classList.toggle('red-focus');
      })

      document.querySelector(DOMstring.inputBtn).classList.toggle('red');
    },

    getDOMstring: function () {
      return DOMstring;
    }
  };
})();

var controller = (function (budgetCtrl, UICtrl) {
  var setupEventListener = function () {
    var DOM = UICtrl.getDOMstring();
    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
    document.addEventListener("keypress", function (e) {
      if (e === 13 || e.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
  };

  var updateBudget = function () {
    // Calculate Budget
    budgetCtrl.calculateBudget();
    // Return budget
    var budget = budgetCtrl.getBudget();
    // Display Budget on UI
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function () {
    // Calculate percentages
    budgetCtrl.calculatePercentages();
    // Read percetages from the budget controller
    var percentages = budgetController.getPercentages();
    //Update the UIwith the new ppercentages
    UICtrl.displayPercentages(percentages);
  };

  var ctrlAddItem = function () {
    var input, newItem;
    // 1. Get input field
    input = UICtrl.getInput();

    if (
      input.description !== "" &&
      !isNaN(input.value) &&
      isNaN(input.description) &&
      input.value > 0
    ) {
      // 2. Insert into budget Controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      // 3. Add to UI
      UICtrl.addListItem(newItem, input.type);
      // 4. Clear
      UICtrl.clearField();
      // Calculate and Update Budget
      updateBudget();

      // Update the new percentages
      updatePercentages();
    } else {
      alert("Please Insert data with correct input type!");
      UICtrl.clearField();
    }
  };

  // Event listener with Event Delegation
  var ctrlDeleteItem = function (event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);
      console.log(ID);

      // 1. delete the item from data structure
      budgetCtrl.deleteItem(type, ID);
      // 2. Delete item from UI
      console.log(itemID);
      UICtrl.deleteListItem(itemID);
      // 3. Update and show the new budget
      updateBudget();

      // Calculate and updaate the percentages
      updatePercentages();
    }
  };

  return {
    init: function () {
      console.log("Application Has Started!");
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      setupEventListener();
    },

    test: function () {
      // var data = {
      //   allitems: {
      //     exp: [expenses = {
      //         id: 0,
      //         name: 'James',
      //         value: 100
      //       },
      //       expenses = {
      //         id: 1,
      //         name: 'James',
      //         value: 100
      //       },
      //       expenses = {
      //         id: 3,
      //         name: 'James',
      //         value: 100
      //       }
      //     ],
      //     inc: []
      //   }
      // };
      // // arrs.exp.forEach(function (cur) {
      // //   b = b + cur.id;
      // // });
      // var come = data.allitems['exp'].map(function (current) {
      //   return current.id;
      // });
      // console.log(come.indexOf(10)); // index utk nyari angka yg di input
    }
  };
})(budgetController, UIController);

controller.init();
controller.test();