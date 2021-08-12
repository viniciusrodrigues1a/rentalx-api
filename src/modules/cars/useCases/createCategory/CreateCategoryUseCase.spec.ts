import { CategoriesRepositoryInMemory } from "@modules/cars/repositories/in-memory/CategoriesRepositoryInMemory";
import { AppError } from "@shared/errors/AppError";

import { CreateCategoryUseCase } from "./CreateCategoryUseCase";

let sut: CreateCategoryUseCase;
let categoriesRepositoryInMemory: CategoriesRepositoryInMemory;

describe("Create Category", () => {
  beforeEach(() => {
    categoriesRepositoryInMemory = new CategoriesRepositoryInMemory();
    sut = new CreateCategoryUseCase(categoriesRepositoryInMemory);
  });

  it("should be able to create a new Category", async () => {
    const category = {
      name: "My category",
      description: "My category description",
    };

    await sut.execute(category);

    const createdCategory = await categoriesRepositoryInMemory.findByName(
      category.name
    );

    expect(createdCategory).toHaveProperty("id");
  });

  it("should NOT be able to create a new Category if name is already taken", async () => {
    const category = {
      name: "My category",
      description: "My category description",
    };

    await sut.execute(category);

    await expect(sut.execute(category)).rejects.toBeInstanceOf(AppError);
  });
});
