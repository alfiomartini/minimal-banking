"use strict";

import { updateMovements, logIn } from "./utils.js";

// Dom Elements

const inputName = document.querySelector(".header__username");
const inputPin = document.querySelector(".header__pin");
const logBtn = document.querySelector(".header__btn");
const movementsElm = document.querySelector(".movements");

function updateUI(account) {
  const movementsStr = updateMovements(account);
  movementsElm.innerHTML = movementsStr;
}

logBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const userName = inputName.value;
  const userPin = inputPin.value;
  const loggedUser = logIn(userName, userPin);
  if (loggedUser) updateUI(loggedUser.account);
});
