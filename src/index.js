"use strict";

//  note that accounts is read-only, since it can be shared by
//  many importing modules
// https://stackoverflow.com/questions/53617972/exported-variables-are-read-only

import { accounts as libAccounts } from "./script.js";
let accounts = [...libAccounts];
import {
  updateMovements,
  logIn,
  updateHello,
  transferVal,
  computeUsername,
  getBalance,
} from "./utils.js";
import {
  updateBalanceDate,
  updateSummary,
  getSummaryAccount,
  roundTo,
} from "./utils.js";

// nobody is logged in
let loggedUser = null;

// Dom Elements

const inputName = document.querySelector(".header__username");
const inputPin = document.querySelector(".header__pin");
const logBtn = document.querySelector(".header__btn");
const logoutBtn = document.querySelector(".logout__btn");
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

function updateUI(currentUser) {
  logBtn.classList.add("hidden");
  logoutBtn.classList.remove("hidden");
  if (!currentUser) {
    wellcomeElm.textContent = "Log in to get started";
    mainElm.classList.add("hidden");
    return;
  }
  const { balance, account } = currentUser;
  mainElm.classList.remove("hidden");
  movementsElm.innerHTML = updateMovements(account);
  wellcomeElm.textContent = updateHello(account);
  balanceDateElm.textContent = updateBalanceDate();
  const { inMov, outMov, interest } = getSummaryAccount(account);
  balanceVal.textContent = roundTo(balance, 2) + "US$";
  summary.innerHTML = updateSummary(inMov, outMov, interest);
  inputName.value = "";
  inputPin.value = "";
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
  // find if there is any deposit 10%  greater than the requested loan
  const { movements } = loggedUser.account;
  const loanApproved = movements
    .filter((mov) => mov > 0)
    // loan * 0.1 + loan = loan * (0.1 + 1) = loan * 1.1
    .some((dep) => dep >= loan * (10 / 100));
  if (loanApproved) {
    movements.push(loan);
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

logoutBtn.addEventListener("click", () => {
  loggedUser = null;
  updateUI(loggedUser);
});
