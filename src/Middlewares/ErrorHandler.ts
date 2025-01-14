import { NextFunction, Request, Response } from "express";

class ErrorHandler {
  private static instance: ErrorHandler;

  private constructor() {}

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  // 1-Not found.
  public notFound(req: Request, res: Response, next: NextFunction): void {
    const error = new Error(`Not found: ${req.originalUrl}`);
    res.sendStatus(404);
    next(error);
  }

  public handleError(
    error: any,
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = error.message;
    let errorDetails: any = {};
    console.log("#".repeat(50));
    console.log(error);
    console.log("#".repeat(50));

    if (error.name === "ValidationError") {
      message = "Validation Error";
      statusCode = 400;
      errorDetails = Object.values(error.errors).map((val: any) => ({
        message: val.message,
        path: val.path,
        kind: val.kind,
        value: val.value,
      }));
    } else if (error.name === "CastError" && error.kind) {
      statusCode = 404;
      message = "Resource Not Found";
    }

    return res.status(statusCode).json({
      message,
      errors: errorDetails,
      stack: process.env.NODE_ENV === "development" ? error.stack : null,
    });
  }
}

export default ErrorHandler.getInstance();
