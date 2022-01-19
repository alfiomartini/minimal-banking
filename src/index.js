"use strict";

//  note that accounts is read-only, since it can be shared by
//  many importing modules
// https://stackoverflow.com/questions/53617972/exported-variables-are-read-only

import { accounts } from "./script.js";
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

function updateUI(currentUser) {
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
}

logBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const userName = inputName.value;
  const userPin = inputPin.value;
  loggedUser = logIn(userName, userPin);
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
  if (transferVal(fromAccount, toPinNumber, transferAmount)) {
    loggedUser.balance = getBalance(loggedUser.account);
    updateUI(loggedUser);
    console.log("Transfer concluded");
  } else console.log("Invalid transfer (invalid account?)");
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
  loggedUser = null;
  updateUI(loggedUser);
});
