import { restrictTo } from "../../api/v1/middleware/auth.middleware";
import { Request, Response, NextFunction } from "express";

const mockNext = (): NextFunction => jest.fn() as any;
const mockResponse = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("restrictTo Middleware", () => {
  it("should allow access for matching roles", () => {
    const middleware = restrictTo("AGENT", "ADMIN");
    const req = { user: { role: "AGENT" } } as any as Request;
    const res = mockResponse();
    const next = mockNext();

    middleware(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should deny access for non-matching roles", () => {
    const middleware = restrictTo("AGENT", "ADMIN");
    const req = { user: { role: "USER" } } as any as Request;
    const res = mockResponse();
    const next = mockNext();

    expect(() => middleware(req, res, next)).toThrow("You do not have permission to perform this action");
  });

  it("should deny access if user is not attached to request", () => {
    const middleware = restrictTo("AGENT", "ADMIN");
    const req = {} as any as Request;
    const res = mockResponse();
    const next = mockNext();

    expect(() => middleware(req, res, next)).toThrow("You do not have permission to perform this action");
  });
});
