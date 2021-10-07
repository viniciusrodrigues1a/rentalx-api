import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { Rental } from "@modules/rentals/infra/typeorm/entities/Rental";
import { IRentalsRepository } from "@modules/rentals/repositories/IRentalsRepository";
import { AppError } from "@shared/errors/AppError";

dayjs.extend(utc);

interface IRequest {
  user_id: string;
  car_id: string;
  expected_return_date: Date;
}

class CreateRentalUseCase {
  constructor(private rentalsRepository: IRentalsRepository) {}

  async execute({
    user_id,
    car_id,
    expected_return_date,
  }: IRequest): Promise<Rental> {
    const carUnavailable = await this.rentalsRepository.findOpenRentalByCar(
      car_id
    );

    if (carUnavailable) {
      throw new AppError("Car is unavailable");
    }

    const isThereRentalOpenForUser = await this.rentalsRepository.findOpenRentalByUser(
      user_id
    );

    if (isThereRentalOpenForUser) {
      throw new AppError("User already has an open rental");
    }

    const expectedReturnDateFormatted = dayjs(expected_return_date)
      .utc()
      .local()
      .format();
    const now = dayjs().utc().local().format();
    const dateDiff = dayjs(expectedReturnDateFormatted).diff(now, "hours");

    const minimumReturnDateDiff = 24;
    if (dateDiff < minimumReturnDateDiff) {
      throw new AppError("Invalid return time");
    }

    const rental = await this.rentalsRepository.create({
      user_id,
      car_id,
      expected_return_date,
    });

    return rental;
  }
}

export { CreateRentalUseCase };
