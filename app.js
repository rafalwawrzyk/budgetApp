/////////////////////////////////////////////////////////////////////////////
//BUDGET CONTROLLER//
////////////////////////////////////////////////////////////////////////////

var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentage = function() {
    return this.percentage;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

  var calculateTotal = function(type) {
    var sum = 0
    data.allItems[type].forEach(function(item) {
      sum += item.value;
    })
    data.totals[type] = sum;
  }




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
    addItem: function(type, des, val) {
      var newItem;
      var ID;

      // create new id
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      // create new item based on 'inc' or 'exp' type
      if (type === 'exp') {
        newItem = new Expense(ID, des, val)
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val)
      }

      // push it into our data structure
      data.allItems[type].push(newItem);

      //return new element
      return newItem;
    },
    deleteItem: function(type, id) {
      var ids;
      var index;
      var ids = data.allItems[type].map(function(item) { // [0,1,2,3,4]
        return item.id;
      })
      index = ids.indexOf(id)
      if (index !== -1) {
        data.allItems[type].splice(index, 1)
      }

    },
    calculateBudget: function(type) {

      // calculate total income and expenses
      calculateTotal('exp')
      calculateTotal('inc')
      // calculate budget: income - expenses
      data.budget = data.totals.inc - data.totals.exp
      // calculate the percentage of income that we spent
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

      } else {
        data.procentage = -1;
      }


    },
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(item) {
        item.calcPercentage(data.totals.inc);
      })
    },
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(item) {
        return item.getPercentage();
      })
      return allPerc;
    },
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function() {
      console.log(data.allItems.inc)
    }



  }


})();

/////////////////////////////////////////////////////////////////////////////
//UI CONTROLLER//
////////////////////////////////////////////////////////////////////////////

var UIController = (function() {
  var DOMstrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputButton: '.add__btn',
    incomeContainer: '.income__list',
    expensesContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incomeLabel: '.budget__income--value',
    expenseLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    expensesPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'


  }
  //some code
  return {
    getInput: function() {
      return {
        type: document.querySelector(DOMstrings.inputType).value, // inc or exp
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
      }
    },
    addListItem: function(obj, type) {
      var html;
      var newHtml;
      var element;
      // Create HTML string with placeholder text-align

      if (type === 'inc') {
        element = DOMstrings.incomeContainer;
        html = `<div class="item clearfix" id="inc-%id%">
            <div class="item__description">%description%</div>
            <div class="right clearfix">
                <div class="item__value">%value%</div>
                <div class="item__delete">
                    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                </div>
            </div>
        </div>`;
      } else if (type === 'exp') {
        element = DOMstrings.expensesContainer;
        html = `<div class="item clearfix" id="exp-%id%">
          <div class="item__description">%description%</div>
          <div class="right clearfix">
              <div class="item__value">%value%</div>
              <div class="item__percentage">21%</div>
              <div class="item__delete">
                  <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
              </div>
          </div>
      </div>`
      }





      // Replace placeholder with actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', this.formatNumber(obj.value, type));
      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);



    },
    deleteListItem: function(selectorID) {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: function() {
      var fields;
      fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      fields.forEach(function(input) {
        input.value = "";
      })
      fields[0].focus();

    },
    displayBudget: function(obj) {
      obj.budget > 0 ? type = 'inc' : type = 'exp'
      document.querySelector(DOMstrings.budgetLabel).textContent = this.formatNumber(obj.budget, type);
      document.querySelector(DOMstrings.incomeLabel).textContent = this.formatNumber(obj.totalInc, 'inc');
      document.querySelector(DOMstrings.expenseLabel).textContent = this.formatNumber(obj.totalExp, 'exp');


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }

    },
    displayPercentages: function(percentagesArr) {

      var fields = document.querySelectorAll(DOMstrings.expensesPercentageLabel)


      var nodeListForEach = function(list, callback) {
        for (let i = 0; i < list.length; i++) {
          callback(list[i], i)
        }
      }

      nodeListForEach(fields, function(current, index) {
        if (percentagesArr[index] > 0) {
          current.textContent = percentagesArr[index] + '%';
        } else {
          current.textContent = '---';
        }
      })

    },
    formatNumber: function(num, type) {
      var numSplit;
      var int;
      var dec;
      // + or - before number
      // exactly to decimal pointer
      // comma separate the thousand

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');
      int = numSplit[0];
      if (int.length > 3) {
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
      }
      dec = numSplit[1];



      return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    },
    displayMonth: function() {
      var now;
      var year;
      var month;
      var monthArray;

      var now = new Date();
      year = now.getFullYear();
      monthArray = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      month = now.getMonth()
      document.querySelector(DOMstrings.dateLabel).textContent = monthArray[month] + ' ' + year;
    },
    changeType: function() {
      var fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
      [].forEach.call(fields, function(item) {
        item.classList.toggle('red-focus');
      })
      document.querySelector(DOMstrings.inputButton).classList.toggle('red')

    },


    getDOMstrings: function() {
      return DOMstrings;
    }
  };

})()





/////////////////////////////////////////////////////////////////////////////
/////////////////////////    GLOBAL APP CONTROLLER    //////////////////////
////////////////////////////////////////////////////////////////////////////

var controller = (function(budgetCtrl, UICtrl) {

  var setupEventListeners = function() {
    var DOMStr = UIController.getDOMstrings();
    const addBtn = document.querySelector(DOMStr.inputButton);
    addBtn.addEventListener('click', ctrlAddItem)
    const globalEnter = document.addEventListener('keypress', function(event) {
      if (event.charCode === 13) {
        ctrlAddItem()
      }
    })
    document.querySelector(DOMStr.container).addEventListener('click', ctrlDeleteItem)

    document.querySelector(DOMStr.inputType).addEventListener('change', UICtrl.changeType)
  };





  var updateBudget = function() {
    // 5. Calculate the budget
    budgetCtrl.calculateBudget();
    // 5.1 Return Budget
    var budget = budgetCtrl.getBudget()
    // 6. Display the budget on the UI
    UICtrl.displayBudget(budget)
  }
  var updatePercentages = function() {
    // calculate procentages
    budgetCtrl.calculatePercentages();
    // return percentages
    var percentages = budgetCtrl.getPercentages();
    // display in Ui
    UICtrl.displayPercentages(percentages)
  }

  var ctrlAddItem = function() {

    var input,
      newItem;

    // 1. Get field input data
    var input = UICtrl.getInput();
    // do only when inputs not empty , value > 0 , and if its number
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      // 2. Add item to the budget controller
      var newItem = budgetCtrl.addItem(input.type, input.description, input.value)
      // 3. Add the item to UI
      UICtrl.addListItem(newItem, input.type);
      //4. Clear the fields
      UICtrl.clearFields()
      //5. calculate and update budget
      updateBudget();
      //6. calculate and update percentages for each item
      updatePercentages();
    }

  }

  var ctrlDeleteItem = function(event) {
    var itemID;
    var splitID;
    var type;
    var ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);

      // delete item form data structure
      budgetCtrl.deleteItem(type, ID)
      // delete the item from the ui
      UICtrl.deleteListItem(itemID)
      // update and show the new budget
      updateBudget();
      // calculate and update percentages for each item
      updatePercentages();


    }
  }

  return {
    init: function() {
      // updateBudget();
      UICtrl.displayMonth()
      UIController.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      })
      setupEventListeners()

    }
  }

})(budgetController, UIController)

controller.init();
