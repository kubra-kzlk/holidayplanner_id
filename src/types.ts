export interface ListCountries {
  countries: Country[];
}

export interface Country {
  id: number;            // nieuw in dataset
  code: string;
  name: string;
  holidays: Holiday[];
}

export interface Holiday {
  id: number;
  year: number;
  date: Date;            // dataset levert string; we casten naar Date in code
  name: string;
  type: string;
}

export interface OutputHoliday extends Holiday {
  countryCode: string;
  countryName: string;
}

export type HolidaysByYearResponse = OutputHoliday[];

// Handige props voor de /holidays/[year]-pagina
export interface HolidayDetailPageProps extends ListCountries {
  year: number;
  holidays: OutputHoliday[];
}
