import { ICreateUserDTO } from "@modules/accounts/dtos/ICreateUserDTO";
import { UsersRepositoryInMemory } from "@modules/accounts/repositories/in-memory/UsersRepositoryInMemory";
import { AppError } from "@shared/errors/AppError";

import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";

let sut: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let usersRepositoryInMemory: UsersRepositoryInMemory;

describe("Authenticate User", () => {
  beforeEach(() => {
    usersRepositoryInMemory = new UsersRepositoryInMemory();
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory);
    sut = new AuthenticateUserUseCase(usersRepositoryInMemory);
  });

  it("should be able to authenticate a user", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@email.com",
      name: "user",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    const result = await sut.execute({
      email: user.email,
      password: user.password,
    });

    expect(result).toHaveProperty("token");
  });

  it("should NOT be able to authenticate with a non-existent user", async () => {
    await expect(
      sut.execute({
        email: "invalid@email.com",
        password: "1234",
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it("should NOT be able to authenticate with incorrect password", async () => {
    const user: ICreateUserDTO = {
      driver_license: "000123",
      email: "user@email.com",
      name: "user",
      password: "1234",
    };
    await createUserUseCase.execute(user);

    await expect(
      sut.execute({
        email: user.email,
        password: "incorrect_pa55",
      })
    ).rejects.toBeInstanceOf(AppError);
  });
});
