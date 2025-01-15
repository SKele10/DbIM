import { GraphQLError } from "graphql";
import moment from "moment";
import { ObjectId } from "mongodb";

const allowedDateFormats = ["MM/DD/YYYY", "MM/D/YYYY", "M/DD/YYYY", "M/D/YYYY"];

const helper = {
  checkString: (string, stringName) => {
    string = string.trim();
    if (!string)
      throw new GraphQLError(`${stringName} is invalid`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    return string;
  },
  checkName: (string, stringName) => {
    string = string.trim();
    if (!/^[a-zA-Z\s]+$/.test(string) || !string) {
      throw new GraphQLError(`${stringName} is invalid`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return string;
  },
  checkDate: (string, stringName) => {
    string = string.trim();
    if (!moment(string, allowedDateFormats, true).isValid()) {
      throw new GraphQLError(`${stringName} is invalid`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    }
    return new moment(string, "MM/DD/YYYY h:mm A").toDate();
  },
  checkObjectId: (string) => {
    string = string.trim();
    if (!ObjectId.isValid(string))
      throw new GraphQLError(`Invalid ObjectId`, {
        extensions: { code: "BAD_USER_INPUT" },
      });
    return string;
  },
};

export default helper;
