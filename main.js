"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
    owner: "Jonas Schmedtmann",
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        "2019-11-18T21:31:17.178Z",
        "2019-12-23T07:42:02.383Z",
        "2020-01-28T09:15:04.904Z",
        "2020-04-01T10:17:24.185Z",
        "2020-05-08T14:11:59.604Z",
        "2020-05-27T17:01:17.194Z",
        "2025-07-10T23:36:17.929Z",
        "2025-07-16T10:51:36.790Z",
    ],
    currency: "EUR",
    locale: "pt-PT", // de-DE
};

const account2 = {
    owner: "Jessica Davis",
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        "2019-11-01T13:15:33.035Z",
        "2019-11-30T09:48:16.867Z",
        "2019-12-25T06:04:23.907Z",
        "2020-01-25T14:18:46.235Z",
        "2020-02-05T16:33:06.386Z",
        "2020-04-10T14:43:26.374Z",
        "2020-06-25T18:49:59.371Z",
        "2020-07-26T12:01:20.894Z",
    ],
    currency: "USD",
    locale: "en-US",
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

//Functions
let currentAccount, timer;

const startLogoutTimer = function () {
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        labelTimer.textContent = `${min}:${sec}`;
        if (time == 0) {
            containerApp.style.opacity = 0;
            labelWelcome.textContent = "log in to get started";
        }
        time--;
    };
    let time = 120;

    tick();

    const timer = setInterval(tick, 1000);

    return timer;
};

const formatCur = function (value, locale, currency) {
    return Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency,
    }).format(value);
};
const formatMovementDate = function (date, locale) {
    const CalcDaysPassed = (date1, date2) =>
        Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

    const daysPassed = CalcDaysPassed(new Date(), date);

    if (daysPassed === 0) return "Today";
    if (daysPassed === 1) return "Yesterday";
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    return new Intl.DateTimeFormat(locale).format(date);
};

const displayMovements = function (acc, sort = false) {
    const combinedMovsDate = acc.movements.map((mov, i) => ({
        movement: mov,
        movementDate: acc.movementsDates.at(i),
    }));

    if (sort) combinedMovsDate.sort((a, b) => a.movement - b.movement);

    containerMovements.innerHTML = "";

    combinedMovsDate.forEach(function (obj, i) {
        const { movement, movementDate } = obj;
        const type = movement > 0 ? "deposit" : "withdrawal";
        const date = new Date(movementDate);
        const displayDate = formatMovementDate(date, acc.locale);

        const formattedMov = formatCur(movement, acc.locale, acc.currency);
        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">
                    ${i} ${type}
                </div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>
        `;
        containerMovements.insertAdjacentHTML("afterbegin", html);
    });
};

const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce(
        (acc, cur) => Number(acc) + Number(cur),
        0
    );
    labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const displaySummary = function (acc) {
    let income = acc.movements
        .filter(el => el > 0)
        .reduce((acc, cur) => Number(acc) + Number(cur), 0);
    labelSumIn.textContent = formatCur(income, acc.locale, acc.currency);
    let outcome = acc.movements
        .filter(el => el < 0)
        .reduce((acc, cur) => Number(acc) + Number(cur), 0);
    labelSumOut.textContent = formatCur(
        Math.abs(outcome),
        acc.locale,
        acc.currency
    );
    const interest = acc.movements
        .filter(mov => mov > 0)
        .map(deposit => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = formatCur(
        interest,
        acc.locale,
        acc.currency
    );
};

const createUsernames = function (accs) {
    accs.forEach(
        acc =>
            (acc.username = acc.owner
                .toLowerCase()
                .split(" ")
                .map(name => name[0])
                .join(""))
    );
    return accounts;
};
createUsernames(accounts);

const updateUI = function (acc) {
    // Display movements
    displayMovements(acc);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    displaySummary(acc);
};

//Event listeners

btnLogin.addEventListener("click", function (e) {
    e.preventDefault();
    currentAccount = accounts.find(
        name => name.username === inputLoginUsername.value
    );
    if (currentAccount?.pin === +inputLoginPin.value) {
        labelWelcome.textContent = `Good Day, ${
            currentAccount.owner.split(" ")[0]
        }!`;
        containerApp.style.opacity = 100;
        const date = new Date();
        labelDate.textContent = new Intl.DateTimeFormat(
            currentAccount.locale
        ).format(date);

        if (timer) clearInterval(timer);
        timer = startLogoutTimer();
        updateUI(currentAccount);
    }
});
btnTransfer.addEventListener("click", function (e) {
    e.preventDefault();
    //date
    const date = new Date().toISOString();

    const receiverAccount = accounts.find(
        acc => acc.username === inputTransferTo.value
    );
    const amount = Number(inputTransferAmount.value);

    const balance = currentAccount.balance;

    if (
        amount > 0 &&
        balance >= amount &&
        receiverAccount &&
        receiverAccount?.username !== currentAccount.username
    ) {
        //add mov to accounts
        currentAccount.movements.push(-amount);
        receiverAccount.movements.push(amount);

        //add date
        currentAccount.movementsDates.push(date);
        receiverAccount.movementsDates.push(date);

        //updateUI
        updateUI(currentAccount);
        inputTransferAmount.value = "";
        inputTransferTo.value = "";
        clearInterval(timer);
        timer = startLogoutTimer();
    }
});
btnLoan.addEventListener("click", function (e) {
    e.preventDefault();
    //add amount
    setTimeout(function () {
        const amount = Math.floor(inputLoanAmount.value);
        //add date
        const date = new Date().toISOString();
        if (
            amount > 0 &&
            currentAccount.movements.some(mov => mov >= amount * 0.1)
        ) {
            currentAccount.movements.push(amount);
            currentAccount.movementsDates.push(date);
            updateUI(currentAccount);
            clearInterval(timer);
            timer = startLogoutTimer();
        }
    }, 3000);
});

btnClose.addEventListener("click", function (e) {
    e.preventDefault();
    if (
        inputCloseUsername.value == currentAccount.username &&
        inputClosePin.value == currentAccount.pin
    ) {
        const index = accounts.findIndex(
            acc => currentAccount.username == acc.username
        );
        accounts.splice(index, 1);
        console.log(accounts);
    }

    inputClosePin.value, (inputCloseUsername.value = "");

    containerApp.style.opacity = 0;
});
let sorted = false;
btnSort.addEventListener("click", function (e) {
    e.preventDefault();
    displayMovements(currentAccount, !sorted);
    sorted = !sorted;
});
/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
    ["USD", "United States dollar"],
    ["EUR", "Euro"],
    ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
