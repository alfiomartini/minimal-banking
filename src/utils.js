"use strict";

//  functions

export function computeUsername(account) {
  let { owner } = account;
  const username = owner
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toLowerCase();
  return username;
}

export function transferVal(
  accounts,
  fromAccount,
  toPinNumber,
  transferAmount
) {
  // console.log(fromAccount, toPinNumber, transferAmount);
  const toAccount = accounts.find((account) => account.pin === toPinNumber);
  if (!toAccount) return false; // have to signal error to user
  fromAccount.movements.push(-transferAmount); // ensure negative movement;
  toAccount.movements.push(transferAmount);
  return true;
}

export function updateMovements(account, sorted = false) {
  const { movements } = account;
  let strMov = "";
  const newMovements = sorted
    ? movements.slice(0).sort((x, y) => x - y)
    : movements;
  newMovements.forEach((mov) => {
    const date = new Date().toLocaleDateString();
    const type = mov < 0 ? "withdrawal" : "deposit";
    if (mov < 0) mov = Math.abs(mov);
    const value = roundTo(mov, 2);
    const movement = `
    <span class="movements__type movements--${type}">${type}</span>
    <span class="movements__date"></span>
    <span class="movements__value">${value} US$</span>
    <span class="line"></span>
    `;
    // most recent first
    strMov = movement + strMov;
  });
  return strMov;
}

export function roundTo(val, places) {
  // let mult = 10 ** places;
  // let num = Math.ceil(val * mult) / mult;
  let numText = String(val);
  let index = numText.indexOf(".");
  if (index === -1) numText += "." + "0".repeat(places);
  else {
    let fraction = numText.slice(index + 1);
    if (fraction.length < places)
      numText += "0".repeat(places - fraction.length);
  }
  return numText;
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
  const localDate = date.toLocaleDateString();
  const hours = `${date.getHours()}:${date.getMinutes()}`;
  return `As of ${localDate}, ${hours}`;
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
  let { pin } = account;
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
