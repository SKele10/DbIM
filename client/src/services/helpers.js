import moment from "moment";

const allowedDateFormats = ["MM/DD/YYYY", "MM/D/YYYY", "M/DD/YYYY", "M/D/YYYY"];

export const checkString = (string, stringName) => {
  if (typeof string !== "string") {
    throw new Error(`${stringName} is missing`);
  }
  string = string.trim();
  if (!string)
    throw new Error(`${stringName} is invalid`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  return string;
};
export const checkName = (string, stringName) => {
  if (typeof string !== "string") {
    throw new Error(`${stringName} is missing`);
  }
  string = string.trim();
  if (!/^[a-zA-Z\s]+$/.test(string) || !string) {
    throw new Error(`${stringName} is invalid`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return string;
};
export const checkDate = (string, stringName) => {
  string = string.trim();
  if (!moment(string, allowedDateFormats, true).isValid()) {
    throw new Error(`${stringName} is invalid`, {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return new moment(string, "MM/DD/YYYY h:mm A").toDate();
};
