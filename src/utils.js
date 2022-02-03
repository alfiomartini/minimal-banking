"use strict";

//  functions

export function keyIsPressed(target) {
  return new Promise((resolve) => {
    document.body.addEventListener(
      "keyup",
      ({ key }) => {
        if (key.toUpperCase() === target.toUpperCase()) {
          resolve();
        }
      },
      { once: true }
    );
  });
}

function getDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours();
  const min = date.getMinutes();
  return `${day}/${month}/${year}`;
}

function getInternationalDate(date, options = {}, locale = "default") {
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function getInternationalNumber(
  number,
  options = { style: "currency", currency: "USD" },
  locale = "en-US"
) {
  return new Intl.NumberFormat(locale, options).format(number);
}

export function computeUsername(account) {
  let { owner } = account;
  const username = owner
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toLowerCase();
  return username;
}

function getMovementsAndDates(movements, movementsDates) {
  const movementsWithDates = movements.reduce((acc, curr, index) => {
    const obj = { movement: curr, movDate: movementsDates[index] };
    return [...acc, obj];
  }, []);
  return movementsWithDates;
}

export function transferVal(
  accounts,
  fromAccount,
  toPinNumber,
  transferAmount
) {
  const toAccount = accounts.find((account) => account.pin === toPinNumber);
  if (!toAccount) return false; // have to signal error to user
  fromAccount.movements.push(-transferAmount); // ensure negative movement;
  fromAccount.movementsDates.push(new Date().toISOString());
  toAccount.movements.push(transferAmount);
  toAccount.movementsDates.push(new Date().toISOString());
  return true;
}

export function updateMovements(account, sorted = false) {
  const { movements, movementsDates } = account;
  const movementsWithDates = getMovementsAndDates(movements, movementsDates);
  let strMov = "";
  const newMovementsWithDates = sorted
    ? movementsWithDates
        .slice(0)
        // order from newer to older
        .sort((x, y) => Date.parse(y.movDate) - Date.parse(x.movDate))
    : movementsWithDates;
  newMovementsWithDates.forEach(({ movement, movDate }, index) => {
    // const dateStr = new Date().toLocaleDateString();
    // const dateStr = getDate(movDate);
    const options = {
      year: "numeric",
      day: "2-digit",
      month: "2-digit",
    };
    const locale = navigator.language;
    const dateStr = getInternationalDate(new Date(movDate), options, locale);
    const type = movement < 0 ? "withdrawal" : "deposit";
    if (movement < 0) movement = Math.abs(movement);
    const value = getInternationalNumber(movement);
    const movementStr = `
    <span class="movements__type movements--${type}">${type}</span>
    <span class="movements__date">${dateStr}</span>
    <span class="movements__value">${value}</span>
    <span class="line"></span>
    `;
    // lest recent first
    // then the newest become the oldest (if sorted = true)
    strMov = movementStr + strMov;
  });
  return strMov;
}

export function roundTo(val, places) {
  let numText = String(val);
  let index = numText.indexOf(".");
  if (index === -1) {
    numText += "." + "0".repeat(places);
    return numText;
  } // else
  const integral = numText.slice(0, index);
  let fraction = numText.slice(index + 1);
  if (fraction.length >= places) {
    fraction = fraction.slice(0, places);
    return integral + "." + fraction;
  } else {
    return integral + "." + fraction + "0".repeat(places - fraction.length);
  }
}

export function getSummaryAccount(account) {
  let inMov = 0;
  let outMov = 0;
  let interest = 0;
  const { movements, interestRate } = account;
  movements.forEach((mov) => {
    if (mov > 0) inMov += mov;
    else outMov += mov;
  });
  outMov = Math.abs(outMov);
  interest = movements
    .filter((mov) => mov > 0)
    .map((deposit) => (deposit * interestRate) / 100)
    .reduce((acc, tax) => acc + tax, 0);
  return { inMov, outMov, interest };
}

export function getBalance(account) {
  const { movements } = account;
  return movements.reduce((acc, mov) => acc + mov, 0);
}

export function updateBalanceDate() {
  const date = new Date();
  // https://www.w3schools.com/jsref/jsref_tolocalestring.asp
  // const localDate = date.toLocaleDateString("pt-BR");
  // const hours = date.getHours().toString().padStart(2, "0");
  // const minutes = date.getMinutes().toString().padStart(2, "0");
  const options = {
    year: "numeric",
    day: "2-digit",
    month: "long",
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };

  const locale = navigator.language;
  const dateStr = getInternationalDate(new Date(), options, locale);
  return `As of ${dateStr}`;
}

export function updateHello(account) {
  const hours = new Date().getHours();
  const name = account.owner.split(" ")[0];
  let timeOfDay = "morning";
  if (hours > 12) {
    if (hours < 18) timeOfDay = "afternoon";
    else if (hours > 18 && hours < 20) timeOfDay = "evening";
    else timeOfDay = "night";
  }
  let hello = `Good ${timeOfDay}, ${name}`;
  return hello;
}

export function logIn(accounts, inputName, inputPin) {
  inputPin = parseInt(inputPin);
  const account = accounts.find((account) => {
    return account.pin === inputPin;
  });
  if (!account) {
    console.log("user not found", account);
    return null;
  }
  let { pin, movements, movementsDates } = account;
  const movementsWithDates = getMovementsAndDates(movements, movementsDates);
  // console.log("movement with dates", movementsWithDates);
  const username = computeUsername(account);
  // the first conjunct has been satisfied above
  // so it is trivially true
  if (inputPin === pin && username === inputName) {
    console.log("authentication successful");
    return {
      username,
      account,
      balance: getBalance(account),
    };
  } else {
    console.log("error in authentication");
    return null;
  }
}
