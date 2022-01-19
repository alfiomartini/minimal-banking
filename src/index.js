"use strict";

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

function updateUI(currentUser) {
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
  const fromAccount = loggedUser.account;
  const toPinNumber = Number(transferToElm.value); // check with a regex (pinNumber)
  const transferAmount = Number(transferAmountElm.value); // check with regex
  if (loggedUser.balance < transferAmount) {
    console.log("Insufficient amount in account");
    return;
  }
  if (transferVal(fromAccount, toPinNumber, transferAmount)) {
    loggedUser.balance = getBalance(loggedUser.account);
    updateUI(loggedUser);
    console.log("Transfer concluded");
  } else console.log("Invalid transfer (invalid account?)");
});
