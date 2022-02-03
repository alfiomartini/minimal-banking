"use strict";

//  note that accounts is read-only, since it can be shared by
//  many importing modules
// https://stackoverflow.com/questions/53617972/exported-variables-are-read-only

import { accounts as libAccounts } from "./script.js";
let accounts = [...libAccounts];
// for debugging purposes
window.accounts = accounts;
import {
  updateMovements,
  logIn,
  updateHello,
  transferVal,
  computeUsername,
  getBalance,
  keyIsPressed,
} from "./utils.js";
import {
  updateBalanceDate,
  getSummaryAccount,
  roundTo,
  getInternationalNumber,
} from "./utils.js";

// nobody is logged in
let loggedUser = null;

// Dom Elements

const inputName = document.querySelector(".header__username");
inputName.value = "";
const inputPin = document.querySelector(".header__pin");
inputPin.value = "";
const logBtn = document.querySelector(".header__btn");
const logoutBtn = document.querySelector(".logout__btn");
const userNameLogin = document.querySelector(".header__username");
const pinNumberLogin = document.querySelector(".header__pin");
const movementsElm = document.querySelector(".movements");
const wellcomeElm = document.querySelector(".header__wellcome");
const balanceDateElm = document.querySelector(".balance__current__date");
const mainElm = document.querySelector(".main");
const summary = document.querySelector(".summary");
const balanceVal = document.querySelector(".balance__value");
const transferToElm = document.querySelector(".transfer__to");
const transferAmountElm = document.querySelector(".transfer__amount");
const transferBtn = document.querySelector(".transfer__button");
const closeBtn = document.querySelector(".close__button");
const closeUserInput = document.querySelector(".close--user");
const closeAccountInput = document.querySelector(".close--account");
const loanBtn = document.querySelector(".loan__button");
const loanInput = document.querySelector(".loan--amount");
const sortBtn = document.querySelector(".sort__btn");
const valueIn = document.querySelector(".value__in");
const valueOut = document.querySelector(".value__out");
const valueInterest = document.querySelector(".value__interest");

function updateUI(currentUser) {
  // console.log("accounts, user", accounts, currentUser);
  inputName.value = "";
  inputPin.value = "";
  if (!currentUser) {
    wellcomeElm.textContent = "Log in to get started";
    userNameLogin.classList.remove("hidden");
    pinNumberLogin.classList.remove("hidden");
    logBtn.classList.remove("hidden");
    logoutBtn.classList.add("hidden");
    mainElm.classList.add("hidden");
    return;
  }
  const { balance, account } = currentUser;
  logBtn.classList.add("hidden");
  userNameLogin.classList.add("hidden");
  pinNumberLogin.classList.add("hidden");
  logoutBtn.classList.remove("hidden");
  mainElm.classList.remove("hidden");
  movementsElm.innerHTML = updateMovements(account);
  wellcomeElm.textContent = updateHello(account);
  balanceDateElm.textContent = updateBalanceDate();
  const { inMov, outMov, interest } = getSummaryAccount(account);
  balanceVal.textContent = getInternationalNumber(balance);
  valueIn.textContent = getInternationalNumber(inMov);
  valueOut.textContent = getInternationalNumber(outMov);
  valueInterest.textContent = getInternationalNumber(interest);
  transferToElm.value = "";
  transferAmountElm.value = "";
  closeUserInput.value = "";
  closeAccountInput.value = "";
  loanInput.value = "";
}

logBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const userName = inputName.value;
  const userPin = inputPin.value;
  loggedUser = logIn(accounts, userName, userPin);
  if (loggedUser) updateUI(loggedUser);
});

transferBtn.addEventListener("click", (event) => {
  event.preventDefault();
  if (!loggedUser) return;
  const fromAccount = loggedUser.account;
  const toPinNumber = Number(transferToElm.value); // check with a regex (pinNumber)
  if (toPinNumber === loggedUser.pin) {
    console.log("Cannot transfer money to the same account");
    return;
  }
  const transferAmount = Number(transferAmountElm.value); // check with regex
  if (loggedUser.balance < transferAmount) {
    console.log("Insufficient amount in account");
    return;
  }

  if (transferAmount < 0) {
    console.log("Negative value not allowed");
    return;
  }
  if (transferVal(accounts, fromAccount, toPinNumber, transferAmount)) {
    loggedUser.balance = getBalance(loggedUser.account);
    updateUI(loggedUser);
    console.log("Transfer concluded");
  } else console.log("Invalid transfer (invalid account?)");
});

loanBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const loan = Number(loanInput.value);
  if (loan <= 0) return;
  // find if there is any deposit that is greater that 10% of the required loan
  const { movements, movementsDates } = loggedUser.account;
  const loanApproved = movements
    .filter((mov) => mov > 0)
    .some((dep) => dep >= loan * (10 / 100));
  if (loanApproved) {
    movements.push(loan);
    movementsDates.push(new Date().toISOString());
    loggedUser.balance = getBalance(loggedUser.account);
    updateUI(loggedUser);
  } else {
    console.log("Value not approved.");
  }
});

closeBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const { username, account } = loggedUser;
  const closeUser = closeUserInput.value;
  const closeAccount = Number(closeAccountInput.value);
  if (closeUser !== username || closeAccount !== account.pin) {
    console.log("Logged in user can only close its own account.");
    return;
  }
  accounts = accounts.filter((acc) => acc !== account);
  loggedUser = null;
  updateUI(loggedUser);
});

logoutBtn.addEventListener("click", (event) => {
  event.preventDefault();
  loggedUser = null;
  updateUI(loggedUser);
});

let sortedMovements = true;
sortBtn.addEventListener("click", () => {
  movementsElm.innerHTML = updateMovements(loggedUser.account, sortedMovements);
  sortedMovements = !sortedMovements;
});
