import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

import { IDateProvider } from "../IDateProvider";

dayjs.extend(utc);

class DayjsDateProvider implements IDateProvider {
  dateNow(): Date {
    return dayjs().toDate();
  }

  convertToUtc(date: Date): string {
    return dayjs(date).utc().local().format();
  }

  compareInHours(date: Date, compareTo: Date): number {
    const dateUtc = this.convertToUtc(date);
    const compareToUtc = this.convertToUtc(compareTo);
    return dayjs(compareToUtc).diff(dateUtc, "hours");
  }
}

export { DayjsDateProvider };
