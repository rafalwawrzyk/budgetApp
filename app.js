/////////////////////////////////////////////////////////////////////////////
//BUDGET CONTROLLER//
////////////////////////////////////////////////////////////////////////////

var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  }

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
    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function() {
      console.log(data)
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
    container: '.container'


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
      newHtml = newHtml.replace('%value%', obj.value);
      // insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);



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
      document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
      document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
      document.querySelector(DOMstrings.expenseLabel).textContent = obj.totalExp;


      if (obj.percentage > 0) {
        document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(DOMstrings.percentageLabel).textContent = '---'
      }

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
  };





  var updateBudget = function() {
    // 5. Calculate the budget
    budgetCtrl.calculateBudget();
    // 5.1 Return Budget
    var budget = budgetCtrl.getBudget()
    // 6. Display the budget on the UI
    UICtrl.displayBudget(budget)
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
    }

  }

  var ctrlDeleteItem = function(event) {
    var itemID;
    var splitID;
    var type;
    var ID;
    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if(itemID){
      // inc-1
      splitID = itemID.split('-');
      type = splitID[0];
      ID = splitID[1];

      // delete item form data structure

      // delete the item from the ui

      // update and show the new budget

    }
  }

  return {
    init: function() {
      // updateBudget();
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
