import countriesData from '../../data/countries.json';
import { Country } from '@/schemas/country.schema';

// Type for the countries data structure
interface CountriesResponse {
  data: Country[];
}

// Read countries from local JSON file
export function getCountries(): Country[] {
  const response = countriesData as CountriesResponse;
  return response.data || [];
}

// Get a specific country by ID
export function getCountryById(id: number): Country | undefined {
  const countries = getCountries();
  return countries.find(country => country.id === id);
}

// Get countries with optional filtering
export function getCountriesWithFilter(filter?: (country: Country) => boolean): Country[] {
  const countries = getCountries();
  if (filter) {
    return countries.filter(filter);
  }
  return countries;
}

// Search countries by name
export function searchCountries(query: string): Country[] {
  const countries = getCountries();
  const lowerQuery = query.toLowerCase();
  return countries.filter(country => 
    country.name?.toLowerCase().includes(lowerQuery) ||
    country.official_name?.toLowerCase().includes(lowerQuery) ||
    country.fifa_name?.toLowerCase().includes(lowerQuery)
  );
}
