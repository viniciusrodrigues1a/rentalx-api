interface IDateProvider {
  compareInHours(date: Date, compareTo: Date): number;
  convertToUtc(date: Date): string;
  dateNow(): Date;
}

export { IDateProvider };
