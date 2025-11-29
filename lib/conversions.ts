export type UnitKind = "length" | "weight" | "temperature" | "volume" | "area" | "illuminance" | "torque" | "energy" | "speed" | "pressure" | "power" | "data_size" | "data_rate" | "time" | "currency" | "frequency" | "density" | "force" | "voltage" | "resistance" | "angle" | "luminous_intensity";

export interface UnitDefinition {
  id: string;
  label: string;
  symbol: string;
  kind: UnitKind;
  toBase: (value: number) => number;
  fromBase: (value: number) => number;
  decimalPlaces?: number;
}

export interface ConversionContext {
  from: UnitDefinition;
  to: UnitDefinition;
  kind: UnitKind;
}

const units: Record<string, UnitDefinition> = {
  meter: {
    id: "meter",
    label: "Meter",
    symbol: "m",
    kind: "length",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  kilometer: {
    id: "kilometer",
    label: "Kilometer",
    symbol: "km",
    kind: "length",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 4
  },
  foot: {
    id: "foot",
    label: "Foot",
    symbol: "ft",
    kind: "length",
    toBase: (value) => value * 0.3048,
    fromBase: (value) => value / 0.3048,
    decimalPlaces: 4
  },
  inch: {
    id: "inch",
    label: "Inch",
    symbol: "in",
    kind: "length",
    toBase: (value) => value * 0.0254,
    fromBase: (value) => value / 0.0254,
    decimalPlaces: 4
  },
  centimeter: {
    id: "centimeter",
    label: "Centimeter",
    symbol: "cm",
    kind: "length",
    toBase: (value) => value / 100,
    fromBase: (value) => value * 100,
    decimalPlaces: 4
  },
  millimeter: {
    id: "millimeter",
    label: "Millimeter",
    symbol: "mm",
    kind: "length",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  yard: {
    id: "yard",
    label: "Yard",
    symbol: "yd",
    kind: "length",
    toBase: (value) => value * 0.9144,
    fromBase: (value) => value / 0.9144,
    decimalPlaces: 4
  },
  mile: {
    id: "mile",
    label: "Mile",
    symbol: "mi",
    kind: "length",
    toBase: (value) => value * 1609.344,
    fromBase: (value) => value / 1609.344,
    decimalPlaces: 4
  },
  nautical_mile: {
    id: "nautical_mile",
    label: "Nautical Mile",
    symbol: "nmi",
    kind: "length",
    toBase: (value) => value * 1852,
    fromBase: (value) => value / 1852,
    decimalPlaces: 4
  },
  gram: {
    id: "gram",
    label: "Gram",
    symbol: "g",
    kind: "weight",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  kilogram: {
    id: "kilogram",
    label: "Kilogram",
    symbol: "kg",
    kind: "weight",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  pound: {
    id: "pound",
    label: "Pound",
    symbol: "lb",
    kind: "weight",
    toBase: (value) => value * 0.45359237,
    fromBase: (value) => value / 0.45359237,
    decimalPlaces: 4
  },
  ounce: {
    id: "ounce",
    label: "Ounce",
    symbol: "oz",
    kind: "weight",
    toBase: (value) => value * 0.0283495231,
    fromBase: (value) => value / 0.0283495231,
    decimalPlaces: 4
  },
  stone: {
    id: "stone",
    label: "Stone",
    symbol: "st",
    kind: "weight",
    toBase: (value) => value * 6.35029318,
    fromBase: (value) => value / 6.35029318,
    decimalPlaces: 4
  },
  liter: {
    id: "liter",
    label: "Liter",
    symbol: "L",
    kind: "volume",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  milliliter: {
    id: "milliliter",
    label: "Milliliter",
    symbol: "mL",
    kind: "volume",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  gallon: {
    id: "gallon",
    label: "US Gallon",
    symbol: "gal",
    kind: "volume",
    toBase: (value) => value * 3.785411784,
    fromBase: (value) => value / 3.785411784,
    decimalPlaces: 4
  },
  gallon_uk: {
    id: "gallon_uk",
    label: "UK Gallon (Imperial)",
    symbol: "gal_uk",
    kind: "volume",
    toBase: (value) => value * 4.54609,
    fromBase: (value) => value / 4.54609,
    decimalPlaces: 4
  },
  quart: {
    id: "quart",
    label: "US Quart",
    symbol: "qt",
    kind: "volume",
    toBase: (value) => value * 0.946352946,
    fromBase: (value) => value / 0.946352946,
    decimalPlaces: 4
  },
  cup: {
    id: "cup",
    label: "US Cup",
    symbol: "cup",
    kind: "volume",
    // 1 US liquid gallon is 16 cups. 1 gallon is 3.785411784 liters.
    toBase: (value) => value * (3.785411784 / 16),
    fromBase: (value) => value / (3.785411784 / 16),
    decimalPlaces: 4
  },
  teaspoon: {
    id: "teaspoon",
    label: "Teaspoon",
    symbol: "tsp",
    kind: "volume",
    // 1 teaspoon = 5 mL = 0.005 liters (FDA/NIST standard for kitchen measures)
    toBase: (value) => value * 0.005,
    fromBase: (value) => value / 0.005,
    decimalPlaces: 4
  },
  celsius: {
    id: "celsius",
    label: "Celsius",
    symbol: "°C",
    kind: "temperature",
    toBase: (value) => value + 273.15,
    fromBase: (value) => value - 273.15,
    decimalPlaces: 2
  },
  fahrenheit: {
    id: "fahrenheit",
    label: "Fahrenheit",
    symbol: "°F",
    kind: "temperature",
    toBase: (value) => ((value - 32) * 5) / 9 + 273.15,
    fromBase: (value) => ((value - 273.15) * 9) / 5 + 32,
    decimalPlaces: 2
  },
  kelvin: {
    id: "kelvin",
    label: "Kelvin",
    symbol: "K",
    kind: "temperature",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  rankine: {
    id: "rankine",
    label: "Rankine",
    symbol: "°R",
    kind: "temperature",
    toBase: (value) => value / 1.8,
    fromBase: (value) => value * 1.8,
    decimalPlaces: 2
  },
  square_meter: {
    id: "square_meter",
    label: "Square Meter",
    symbol: "m²",
    kind: "area",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  square_foot: {
    id: "square_foot",
    label: "Square Foot",
    symbol: "ft²",
    kind: "area",
    toBase: (value) => value * 0.09290304,
    fromBase: (value) => value / 0.09290304,
    decimalPlaces: 4
  },
  acre: {
    id: "acre",
    label: "Acre",
    symbol: "ac",
    kind: "area",
    toBase: (value) => value * 4046.8564224,
    fromBase: (value) => value / 4046.8564224,
    decimalPlaces: 4
  },
  hectare: {
    id: "hectare",
    label: "Hectare",
    symbol: "ha",
    kind: "area",
    toBase: (value) => value * 10000,
    fromBase: (value) => value / 10000,
    decimalPlaces: 4
  },
  lumen: {
    id: "lumen",
    label: "Lumen",
    symbol: "lm",
    kind: "illuminance",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  lux: {
    id: "lux",
    label: "Lux",
    symbol: "lx",
    kind: "illuminance",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  newton_meter: {
    id: "newton_meter",
    label: "Newton-meter",
    symbol: "N·m",
    kind: "torque",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  foot_pound: {
    id: "foot_pound",
    label: "Foot-pound",
    symbol: "ft·lbf",
    kind: "torque",
    toBase: (value) => value * 1.355818,
    fromBase: (value) => value / 1.355818,
    decimalPlaces: 4
  },
  kilocalorie: {
    id: "kilocalorie",
    label: "Kilocalorie",
    symbol: "kcal",
    kind: "energy",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  kilojoule: {
    id: "kilojoule",
    label: "Kilojoule",
    symbol: "kJ",
    kind: "energy",
    toBase: (value) => value * 4.184,
    fromBase: (value) => value / 4.184,
    decimalPlaces: 2
  },
  joule: {
    id: "joule",
    label: "Joule",
    symbol: "J",
    kind: "energy",
    toBase: (value) => value / 4.184,
    fromBase: (value) => value * 4.184,
    decimalPlaces: 2
  },
  calorie: {
    id: "calorie",
    label: "Calorie",
    symbol: "cal",
    kind: "energy",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  second: {
    id: "second",
    label: "Second",
    symbol: "s",
    kind: "time",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  minute: {
    id: "minute",
    label: "Minute",
    symbol: "min",
    kind: "time",
    toBase: (value) => value * 60,
    fromBase: (value) => value / 60,
    decimalPlaces: 2
  },
  hour: {
    id: "hour",
    label: "Hour",
    symbol: "h",
    kind: "time",
    toBase: (value) => value * 3600,
    fromBase: (value) => value / 3600,
    decimalPlaces: 4
  },
  day: {
    id: "day",
    label: "Day",
    symbol: "d",
    kind: "time",
    toBase: (value) => value * 86400,
    fromBase: (value) => value / 86400,
    decimalPlaces: 4
  },
  usd: {
    id: "usd",
    label: "US Dollar",
    symbol: "$",
    kind: "currency",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  eur: {
    id: "eur",
    label: "Euro",
    symbol: "€",
    kind: "currency",
    toBase: (value) => value * 1.10,
    fromBase: (value) => value / 1.10,
    decimalPlaces: 2
  },
  gbp: {
    id: "gbp",
    label: "British Pound",
    symbol: "£",
    kind: "currency",
    toBase: (value) => value * 1.27,
    fromBase: (value) => value / 1.27,
    decimalPlaces: 2
  },
  hertz: {
    id: "hertz",
    label: "Hertz",
    symbol: "Hz",
    kind: "frequency",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  kilohertz: {
    id: "kilohertz",
    label: "Kilohertz",
    symbol: "kHz",
    kind: "frequency",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 2
  },
  megahertz: {
    id: "megahertz",
    label: "Megahertz",
    symbol: "MHz",
    kind: "frequency",
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000,
    decimalPlaces: 2
  },
  gigahertz: {
    id: "gigahertz",
    label: "Gigahertz",
    symbol: "GHz",
    kind: "frequency",
    toBase: (value) => value * 1000000000,
    fromBase: (value) => value / 1000000000,
    decimalPlaces: 2
  },
  kilogram_per_cubic_meter: {
    id: "kilogram_per_cubic_meter",
    label: "Kilogram per Cubic Meter",
    symbol: "kg/m³",
    kind: "density",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  gram_per_cubic_centimeter: {
    id: "gram_per_cubic_centimeter",
    label: "Gram per Cubic Centimeter",
    symbol: "g/cm³",
    kind: "density",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 4
  },
  pounds_per_cubic_foot: {
    id: "pounds_per_cubic_foot",
    label: "Pounds per Cubic Foot",
    symbol: "lb/ft³",
    kind: "density",
    toBase: (value) => value * 16.01846,
    fromBase: (value) => value / 16.01846,
    decimalPlaces: 4
  },
  newton: {
    id: "newton",
    label: "Newton",
    symbol: "N",
    kind: "force",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 3
  },
  kilonewton: {
    id: "kilonewton",
    label: "Kilonewton",
    symbol: "kN",
    kind: "force",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 3
  },
  pound_force: {
    id: "pound_force",
    label: "Pound-Force",
    symbol: "lbf",
    kind: "force",
    toBase: (value) => value * 4.44822,
    fromBase: (value) => value / 4.44822,
    decimalPlaces: 3
  },
  volt: {
    id: "volt",
    label: "Volt",
    symbol: "V",
    kind: "voltage",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  millivolt: {
    id: "millivolt",
    label: "Millivolt",
    symbol: "mV",
    kind: "voltage",
    toBase: (value) => value / 1000,
    fromBase: (value) => value * 1000,
    decimalPlaces: 4
  },
  kilovolt: {
    id: "kilovolt",
    label: "Kilovolt",
    symbol: "kV",
    kind: "voltage",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 4
  },
  ohm: {
    id: "ohm",
    label: "Ohm",
    symbol: "Ω",
    kind: "resistance",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  kilohm: {
    id: "kilohm",
    label: "Kilohm",
    symbol: "kΩ",
    kind: "resistance",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 2
  },
  megohm: {
    id: "megohm",
    label: "Megohm",
    symbol: "MΩ",
    kind: "resistance",
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000,
    decimalPlaces: 2
  },
  degree: {
    id: "degree",
    label: "Degree",
    symbol: "°",
    kind: "angle",
    toBase: (value) => value * 0.0174533,
    fromBase: (value) => value / 0.0174533,
    decimalPlaces: 4
  },
  radian: {
    id: "radian",
    label: "Radian",
    symbol: "rad",
    kind: "angle",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 4
  },
  candela: {
    id: "candela",
    label: "Candela",
    symbol: "cd",
    kind: "luminous_intensity",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  kilometers_per_hour: {
    id: "kilometers_per_hour",
    label: "Kilometers per Hour",
    symbol: "km/h",
    kind: "speed",
    toBase: (value) => value,
    fromBase: (value) => value,
    decimalPlaces: 2
  },
  miles_per_hour: {
    id: "miles_per_hour",
    label: "Miles per Hour",
    symbol: "mph",
    kind: "speed",
    toBase: (value) => value * 1.609344,
    fromBase: (value) => value / 1.609344,
    decimalPlaces: 2
  },
  bar: {
    id: "bar",
    label: "Bar",
    symbol: "bar",
    kind: "pressure",
    toBase: (value) => value * 100000,
    fromBase: (value) => value / 100000,
    decimalPlaces: 4
  },
  psi: {
    id: "psi",
    label: "PSI (Pounds per Square Inch)",
    symbol: "psi",
    kind: "pressure",
    toBase: (value) => value * 6894.757293,
    fromBase: (value) => value / 6894.757293,
    decimalPlaces: 2
  },
  kilopascal: {
    id: "kilopascal",
    label: "Kilopascal",
    symbol: "kPa",
    kind: "pressure",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 2
  },
  kilowatt: {
    id: "kilowatt",
    label: "Kilowatt",
    symbol: "kW",
    kind: "power",
    toBase: (value) => value * 1000,
    fromBase: (value) => value / 1000,
    decimalPlaces: 3
  },
  horsepower: {
    id: "horsepower",
    label: "Horsepower",
    symbol: "hp",
    kind: "power",
    toBase: (value) => value * 745.7,
    fromBase: (value) => value / 745.7,
    decimalPlaces: 3
  },
  megabyte: {
    id: "megabyte",
    label: "Megabyte",
    symbol: "MB",
    kind: "data_size",
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000,
    decimalPlaces: 2
  },
  gigabyte: {
    id: "gigabyte",
    label: "Gigabyte",
    symbol: "GB",
    kind: "data_size",
    toBase: (value) => value * 1000000000,
    fromBase: (value) => value / 1000000000,
    decimalPlaces: 2
  },
  megabit_per_second: {
    id: "megabit_per_second",
    label: "Megabit per Second",
    symbol: "Mbps",
    kind: "data_rate",
    toBase: (value) => value * 125000,
    fromBase: (value) => value / 125000,
    decimalPlaces: 2
  },
  megabyte_per_second: {
    id: "megabyte_per_second",
    label: "Megabyte per Second",
    symbol: "MB/s",
    kind: "data_rate",
    toBase: (value) => value * 1000000,
    fromBase: (value) => value / 1000000,
    decimalPlaces: 2
  }
};

const aliasToUnitId: Record<string, string> = {
  meter: "meter",
  meters: "meter",
  metre: "meter",
  metres: "meter",
  m: "meter",
  kilometre: "kilometer",
  kilometres: "kilometer",
  kilometer: "kilometer",
  kilometers: "kilometer",
  km: "kilometer",
  foot: "foot",
  feet: "foot",
  ft: "foot",
  inch: "inch",
  inches: "inch",
  in: "inch",
  centimeter: "centimeter",
  centimeters: "centimeter",
  centimetre: "centimeter",
  centimetres: "centimeter",
  cm: "centimeter",
  millimeter: "millimeter",
  millimeters: "millimeter",
  millimetre: "millimeter",
  millimetres: "millimeter",
  mm: "millimeter",
  yard: "yard",
  yards: "yard",
  yd: "yard",
  mile: "mile",
  miles: "mile",
  mi: "mile",
  nautical_mile: "nautical_mile",
  nautical_miles: "nautical_mile",
  nmi: "nautical_mile",
  "nautical mile": "nautical_mile",
  "nautical miles": "nautical_mile",
  nm: "nautical_mile",
  gram: "gram",
  grams: "gram",
  g: "gram",
  kilogram: "kilogram",
  kilograms: "kilogram",
  kilogramme: "kilogram",
  kilogrammes: "kilogram",
  kg: "kilogram",
  pound: "pound",
  pounds: "pound",
  lb: "pound",
  lbs: "pound",
  ounce: "ounce",
  ounces: "ounce",
  oz: "ounce",
  stone: "stone",
  stones: "stone",
  liter: "liter",
  liters: "liter",
  litre: "liter",
  litres: "liter",
  l: "liter",
  milliliter: "milliliter",
  milliliters: "milliliter",
  millilitre: "milliliter",
  millilitres: "milliliter",
  ml: "milliliter",
  gallon: "gallon",
  gallons: "gallon",
  gal: "gallon",
  gallon_uk: "gallon_uk",
  gallon_imp: "gallon_uk",
  imperial_gallon: "gallon_uk",
  "imperial gallon": "gallon_uk",
  "uk gallon": "gallon_uk",
  "UK gallon": "gallon_uk",
  quart: "quart",
  quarts: "quart",
  qt: "quart",
  cup: "cup",
  cups: "cup",
  teaspoon: "teaspoon",
  teaspoons: "teaspoon",
  tsp: "teaspoon",
  tsps: "teaspoon",
  "tea spoon": "teaspoon",
  "tea spoons": "teaspoon",
  celsius: "celsius",
  "degrees celsius": "celsius",
  celcius: "celsius",
  "degrees celcius": "celsius",
  fahrenheit: "fahrenheit",
  "degrees fahrenheit": "fahrenheit",
  kelvin: "kelvin",
  kelvins: "kelvin",
  rankine: "rankine",
  rankines: "rankine",
  "degrees rankine": "rankine",
  squaremeter: "square_meter",
  squaremeters: "square_meter",
  sqm: "square_meter",
  "square metre": "square_meter",
  "square meter": "square_meter",
  "square meters": "square_meter",
  "square metres": "square_meter",
  squarefoot: "square_foot",
  squarefeet: "square_foot",
  "square foot": "square_foot",
  "square feet": "square_foot",
  sqft: "square_foot",
  acre: "acre",
  acres: "acre",
  hectare: "hectare",
  hectares: "hectare",
  ha: "hectare",
  lumen: "lumen",
  lumens: "lumen",
  lm: "lumen",
  lux: "lux",
  luxes: "lux",
  lx: "lux",
  newton_meter: "newton_meter",
  "newton-meter": "newton_meter",
  "newton meter": "newton_meter",
  "n·m": "newton_meter",
  "nm": "newton_meter",
  foot_pound: "foot_pound",
  "foot-pound": "foot_pound",
  "foot pound": "foot_pound",
  "ft·lbf": "foot_pound",
  "ftlbf": "foot_pound",
  "ft-lbf": "foot_pound",
  "ft-lb": "foot_pound",
  "lb-ft": "foot_pound",
  kilocalorie: "kilocalorie",
  "kilocalories": "kilocalorie",
  "kcal": "kilocalorie",
  "kcals": "kilocalorie",
  "Calorie": "kilocalorie",
  "Calories": "kilocalorie",
  "food calorie": "kilocalorie",
  "food calories": "kilocalorie",
  "large calorie": "kilocalorie",
  kilojoule: "kilojoule",
  "kilojoules": "kilojoule",
  "kJ": "kilojoule",
  "kjs": "kilojoule",
  joule: "joule",
  "joules": "joule",
  "J": "joule",
  "js": "joule",
  calorie: "calorie",
  "calories": "calorie",
  "cal": "calorie",
  "cals": "calorie",
  "gram calorie": "calorie",
  "gram calories": "calorie",
  "small calorie": "calorie",
  "small calories": "calorie",
  second: "second",
  "seconds": "second",
  "s": "second",
  "sec": "second",
  "secs": "second",
  minute: "minute",
  "minutes": "minute",
  "min": "minute",
  "mins": "minute",
  "m": "minute",
  hour: "hour",
  "hours": "hour",
  "h": "hour",
  "hr": "hour",
  "hrs": "hour",
  day: "day",
  "days": "day",
  "d": "day",
  usd: "usd",
  "US Dollar": "usd",
  "USD": "usd",
  "us dollar": "usd",
  "$": "usd",
  "dollar": "usd",
  "dollars": "usd",
  eur: "eur",
  "Euro": "eur",
  "EUR": "eur",
  "euro": "eur",
  "euros": "eur",
  "€": "eur",
  gbp: "gbp",
  "British Pound": "gbp",
  "GBP": "gbp",
  "british pound": "gbp",
  "pound": "gbp",
  "pounds": "gbp",
  "£": "gbp",
  hertz: "hertz",
  "Hertz": "hertz",
  "Hz": "hertz",
  "hz": "hertz",
  kilohertz: "kilohertz",
  "Kilohertz": "kilohertz",
  "kHz": "kilohertz",
  "khz": "kilohertz",
  "kilohertz": "kilohertz",
  "kilo hertz": "kilohertz",
  megahertz: "megahertz",
  "Megahertz": "megahertz",
  "MHz": "megahertz",
  "mhz": "megahertz",
  "mega hertz": "megahertz",
  gigahertz: "gigahertz",
  "Gigahertz": "gigahertz",
  "GHz": "gigahertz",
  "ghz": "gigahertz",
  "giga hertz": "gigahertz",
  kilogram_per_cubic_meter: "kilogram_per_cubic_meter",
  "kg/m³": "kilogram_per_cubic_meter",
  "kg/m3": "kilogram_per_cubic_meter",
  "kilogram per cubic meter": "kilogram_per_cubic_meter",
  "kilograms per cubic meter": "kilogram_per_cubic_meter",
  gram_per_cubic_centimeter: "gram_per_cubic_centimeter",
  "g/cm³": "gram_per_cubic_centimeter",
  "g/cm3": "gram_per_cubic_centimeter",
  "gram per cubic centimeter": "gram_per_cubic_centimeter",
  "grams per cubic centimeter": "gram_per_cubic_centimeter",
  pounds_per_cubic_foot: "pounds_per_cubic_foot",
  "lb/ft³": "pounds_per_cubic_foot",
  "lb/ft3": "pounds_per_cubic_foot",
  "pound per cubic foot": "pounds_per_cubic_foot",
  "pounds per cubic foot": "pounds_per_cubic_foot",
  "lbs/ft³": "pounds_per_cubic_foot",
  "lbs/ft3": "pounds_per_cubic_foot",
  newton: "newton",
  "Newtons": "newton",
  "N": "newton",
  "newtons": "newton",
  kilonewton: "kilonewton",
  "Kilonewtons": "kilonewton",
  "kN": "kilonewton",
  "kilonewtons": "kilonewton",
  pound_force: "pound_force",
  "Pound-Force": "pound_force",
  "lbf": "pound_force",
  "pound-force": "pound_force",
  "pounds force": "pound_force",
  volt: "volt",
  "Volt": "volt",
  "V": "volt",
  "volts": "volt",
  millivolt: "millivolt",
  "Millivolt": "millivolt",
  "mV": "millivolt",
  "millivolts": "millivolt",
  "mv": "millivolt",
  kilovolt: "kilovolt",
  "Kilovolt": "kilovolt",
  "kV": "kilovolt",
  "kilovolts": "kilovolt",
  "kv": "kilovolt",
  ohm: "ohm",
  "Ohm": "ohm",
  "Ω": "ohm",
  "Ohms": "ohm",
  kilohm: "kilohm",
  "Kilohm": "kilohm",
  "kΩ": "kilohm",
  "kilohms": "kilohm",
  megohm: "megohm",
  "Megohm": "megohm",
  "MΩ": "megohm",
  "megohms": "megohm",
  degree: "degree",
  "Degree": "degree",
  "°": "degree",
  "degrees": "degree",
  "deg": "degree",
  radian: "radian",
  "Radian": "radian",
  "rad": "radian",
  "radians": "radian",
  candela: "candela",
  "Candela": "candela",
  "cd": "candela",
  "candelas": "candela",
  "candle": "candela",
  "candles": "candela",
  kilometers_per_hour: "kilometers_per_hour",
  "km/h": "kilometers_per_hour",
  "kmh": "kilometers_per_hour",
  "km per hour": "kilometers_per_hour",
  "kilometers per hour": "kilometers_per_hour",
  miles_per_hour: "miles_per_hour",
  "mph": "miles_per_hour",
  "mi/h": "miles_per_hour",
  "miles per hour": "miles_per_hour",
  bar: "bar",
  bars: "bar",
  psi: "psi",
  psig: "psi",
  psia: "psi",
  "pounds per square inch": "psi",
  "pound per square inch": "psi",
  kilopascal: "kilopascal",
  kilopascals: "kilopascal",
  kpa: "kilopascal",
  "kPa": "kilopascal",
  kPas: "kilopascal",
  "kilopascals": "kilopascal",
  kilowatt: "kilowatt",
  kilowatts: "kilowatt",
  kw: "kilowatt",
  "kW": "kilowatt",
  "kilowatts": "kilowatt",
  horsepower: "horsepower",
  hp: "horsepower",
  "horse power": "horsepower",
  megabyte: "megabyte",
  megabytes: "megabyte",
  mb: "megabyte",
  "MB": "megabyte",
  gigabyte: "gigabyte",
  gigabytes: "gigabyte",
  gb: "gigabyte",
  "GB": "gigabyte",
  "megabit per second": "megabit_per_second",
  mbps: "megabit_per_second",
  "Mbps": "megabit_per_second",
  "MB/s": "megabyte_per_second",
  "mb/s": "megabyte_per_second",
  "megabyte per second": "megabyte_per_second"
};

const slugSuffixes = ["-converter", "-calculator", "-conversion"];

export function getUnitById(id: string): UnitDefinition | undefined {
  return units[id];
}

export function resolveUnit(token: string): UnitDefinition | undefined {
  const normalized = normalizeToken(token);
  const direct = aliasToUnitId[normalized];
  if (direct) {
    return units[direct];
  }

  const collapsed = normalized.replace(/\s+/g, "");
  const collapsedMatch = aliasToUnitId[collapsed];
  if (collapsedMatch) {
    return units[collapsedMatch];
  }

  return undefined;
}

export function parseConversionFromSlug(slug: string): ConversionContext | null {
  const candidates = extractUnitTokens(slug);
  if (!candidates) {
    return null;
  }

  const fromUnit = resolveUnit(candidates.from);
  const toUnit = resolveUnit(candidates.to);

  if (!fromUnit || !toUnit) {
    return null;
  }

  if (fromUnit.kind !== toUnit.kind) {
    return null;
  }

  return {
    from: fromUnit,
    to: toUnit,
    kind: fromUnit.kind
  };
}

export function convertValue(
  value: number,
  direction: "forward" | "reverse",
  context: ConversionContext
) {
  if (Number.isNaN(value)) {
    return NaN;
  }

  if (direction === "forward") {
    const base = context.from.toBase(value);
    return context.to.fromBase(base);
  }

  const base = context.to.toBase(value);
  return context.from.fromBase(base);
}

export interface ConversionTableRow {
  input: number;
  output: number;
}

export function buildConversionTable(
  seeds: number[],
  context: ConversionContext,
  direction: "forward" | "reverse" = "forward"
): ConversionTableRow[] {
  return seeds.map((seed) => ({
    input: seed,
    output: convertValue(seed, direction, context)
  }));
}

function extractUnitTokens(slug: string): { from: string; to: string } | null {
  const sanitized = slugSuffixes.reduce(
    (value, suffix) => value.replace(new RegExp(`${suffix}$`), ""),
    slug
  );

  const match = sanitized.match(/(.+?)-to-(.+)/);
  if (!match) {
    return null;
  }

  return {
    from: match[1],
    to: match[2]
  };
}

function normalizeToken(token: string) {
  return token
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
