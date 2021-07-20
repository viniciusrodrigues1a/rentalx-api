import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

import { AppError } from "../errors/AppError";
import { UsersRepository } from "../modules/accounts/repositories/implementations/UsersRepository";

interface IPayload {
  sub: string;
}

export async function ensureAuthenticated(
  request: Request,
  _: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token missing", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const { sub: userId } = verify(
      token,
      "dac9630aec642a428cd73f4be0a03569"
    ) as IPayload;

    const usersRepository = new UsersRepository();

    const user = usersRepository.findById(userId);

    if (!user) {
      throw new AppError("User doesn't exist", 401);
    }

    next();
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
}
