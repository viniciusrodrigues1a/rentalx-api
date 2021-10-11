import { inject, injectable } from "tsyringe";

import { ICarsRepository } from "@modules/cars/repositories/ICarsRepository";
import { Rental } from "@modules/rentals/infra/typeorm/entities/Rental";
import { IRentalsRepository } from "@modules/rentals/repositories/IRentalsRepository";
import { IDateProvider } from "@shared/container/providers/DateProvider/IDateProvider";
import { AppError } from "@shared/errors/AppError";

interface IRequest {
  id: string;
  user_id: string;
}

@injectable()
class DevolutionRentalUseCase {
  constructor(
    @inject("RentalsRepository")
    private rentalsRepository: IRentalsRepository,
    @inject("CarsRepository")
    private carsRepository: ICarsRepository,
    @inject("DayjsDateProvider")
    private dateProvider: IDateProvider
  ) {}

  async execute({ id, user_id }: IRequest): Promise<Rental> {
    const rental = await this.rentalsRepository.findById(id);
    const car = await this.carsRepository.findById(rental.car_id);

    if (!rental) {
      throw new AppError("Rental doesn't exist", 404);
    }

    const now = this.dateProvider.dateNow();

    let dailyRateTimes = this.dateProvider.compareInDays(
      rental.start_date,
      now
    );

    if (dailyRateTimes <= 0) {
      const minimumDailyRateTimes = 1;
      dailyRateTimes = minimumDailyRateTimes;
    }

    const devolutionDateDiffInDays = this.dateProvider.compareInDays(
      now,
      rental.expected_return_date
    );

    let total = 0;
    if (devolutionDateDiffInDays > 0) {
      const fine = devolutionDateDiffInDays * car.fine_amount;
      total = fine;
    }

    total += dailyRateTimes * car.daily_rate;

    rental.end_date = this.dateProvider.dateNow();
    rental.total = total;

    await this.rentalsRepository.create(rental);
    await this.carsRepository.updateAvailability(car.id, true);

    return rental;
  }
}

export { DevolutionRentalUseCase };
