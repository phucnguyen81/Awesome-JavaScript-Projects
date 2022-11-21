/**
 * Demontrate some common array opertions.
 */
class ArrayMethods {
  constructor(doc) {
    this.doc = doc;
    this.data = [];
    this.main = this.doc.getElementById("main");

    const addUserBtn = this.doc.getElementById("add-user");
    const doubleBtn = this.doc.getElementById("double");
    const showMillionairesBtn = this.doc.getElementById("show-millionaires");
    const sortBtn = this.doc.getElementById("sort");
    const calculateWealthBtn = this.doc.getElementById("calculate-wealth");

    addUserBtn.addEventListener("click", () => this.addRandomUser());
    doubleBtn.addEventListener("click", () => this.doubleMoney());
    sortBtn.addEventListener("click", () => this.sortByRichest());
    showMillionairesBtn.addEventListener("click", () => this.showMillionaires());
    calculateWealthBtn.addEventListener("click", () => this.calculateWealth());
    
    // Start with some random users
    [1,2,3].forEach(() => this.addRandomUser());
  }

  // Fetch a random user from public API
  async fetchRandomUser(callback) {
    const res = await fetch("https://randomuser.me/api");
    const data = await res.json();
    const user = data.results[0];
    const newUser = {
      name: `${user.name.first} ${user.name.last}`,
      money: Math.floor(Math.random() * 1000000),
    };
    callback(newUser);
  }

  addUser(user) {
    this.data.push(user);
    this.updateDOM();
  }

  // Add a random user
  addRandomUser() {
    this.fetchRandomUser(user => this.addUser(user));
  }

  doubleMoney() {
    this.data = this.data.map((user) => {
      return { ...user, money: user.money * 2 };
    });
    this.updateDOM();
  }

  sortByRichest() {
    this.data.sort((a, b) => b.money - a.money);
    this.updateDOM();
  }
  
  showMillionaires() {
    this.data = this.data.filter((user) => user.money > 1000000);
    this.updateDOM();
  }

  // Show total money of all users
  calculateWealth() {
    // remove the previously added element if any
    this.doc.getElementById("wealth")?.remove();

    const wealth = this.data.reduce((acc, user) => (acc += user.money), 0);

    const wealthE1 = this.doc.createElement("div");
    wealthE1.innerHTML = `<h3 id="wealth"> Total Wealth: <strong>${this.formatMoney(
      wealth
    )}</strong></h3>`;
    this.main.appendChild(wealthE1);
  }

  /**
   * Render the array of users.
   * 
   * This function is called to update the UI when there
   * are changes to the user list.
   * 
   * @param {Array} provideData : the array of users
   */
  updateDOM(provideData) {
    provideData = provideData || this.data;

    // clear previous data
    this.main.innerHTML = "<h2><strong>Person</strong> Wealth</h2>";

    // add new data
    provideData.forEach((item) => {
      const element = this.doc.createElement("div");
      element.classList.add("person");
      element.innerHTML = `<strong>${item.name}</strong> ${this.formatMoney(
        item.money
      )}`;

      this.main.appendChild(element);
    });
  }

  formatMoney(number) {
    return "$" + number.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, "$&,");
  }  
}

// Init the component
new ArrayMethods(document);