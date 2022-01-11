"use strict";

import { updateMovements, logIn, updateHello } from "./utils.js";
import { updateBalanceDate } from "./utils.js";

// Dom Elements

const inputName = document.querySelector(".header__username");
const inputPin = document.querySelector(".header__pin");
const logBtn = document.querySelector(".header__btn");
const movementsElm = document.querySelector(".movements");
const wellcomeElm = document.querySelector(".header__wellcome");
const balanceDateElm = document.querySelector(".balance__current__date");

function updateUI(account) {
  movementsElm.innerHTML = updateMovements(account);
  wellcomeElm.textContent = updateHello(account);
  balanceDateElm.textContent = updateBalanceDate();
}

logBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const userName = inputName.value;
  const userPin = inputPin.value;
  const loggedUser = logIn(userName, userPin);
  inputName.value = "";
  inputPin.value = "";
  if (loggedUser) updateUI(loggedUser.account);
});
