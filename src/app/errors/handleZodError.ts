import { ZodError, ZodIssue } from "zod";
import { IGenericErrorMessage, TErrorDetails, TGenericErrorResponse } from "../interfaces/error";
import { IGenericErrorResponse } from "../interfaces/common";

const handleZodError2 = (err: ZodError): TGenericErrorResponse => {
  let message = "";
  const errorDetails: TErrorDetails = {
    issues: err.issues.map((issue: ZodIssue) => {
      message =
        issue.message === "Expected number, received string"
          ? (issue?.path[issue.path.length - 1] || 'Field') + " " + issue.message
          : message === ""
            ? issue.message
            : message + ". " + issue.message;
      return {
        path: issue?.path[issue.path.length - 1],
        message: issue.message,
      };
    }),
  };

  const statusCode = 400;

  return {
    statusCode,
    message,
    errorDetails,
  };
};

const handleZodError = (error: ZodError): IGenericErrorResponse => {
  const errors: IGenericErrorMessage[] = error.issues.map((issue: ZodIssue) => {
    return {
      path: issue?.path[issue.path.length - 1],
      message: issue?.message,
    };
  });

  const statusCode = 400;

  return {
    statusCode,
    message: "Validation Error",
    errorMessages: errors,
  };
};

export default handleZodError;
