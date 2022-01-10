//  functions
import { accounts } from "./script.js";

export function updateMovements(account) {
  const { movements } = account;
  let strMov = "";
  movements.forEach((mov) => {
    const date = new Date().toLocaleDateString();
    const type = mov < 0 ? "withdrawal" : "deposit";
    const value = mov.toString() + ".00";
    const movement = `
    <span class="movements__type movements--${type}">${type}</span>
    <span class="movements__date">${date}</span>
    <span class="movements__value">${value}</span>
    <span class="line"></span>
    `;
    strMov += movement;
  });
  return strMov;
}

export function logIn(inputName, inputPin) {
  inputPin = parseInt(inputPin);
  const account = accounts.find((account) => {
    return account.pin === inputPin;
  });
  if (!account) {
    console.log("user not found", account);
    return null;
  }
  let { owner, pin } = account;
  const username = owner
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toLowerCase();
  if (inputPin === pin && username === inputName) {
    console.log("authentication successful");
    return {
      username,
      pin,
      account,
    };
  } else {
    console.log("error in authentication");
    return null;
  }
}
