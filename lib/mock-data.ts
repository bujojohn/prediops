export const mockPredictions = {
  data: [
    {
      fixture_id: 1,
      name: "Manchester United vs Liverpool",
      starting_at: "2024-01-15T20:00:00Z",
      probabilities: {
        home: 0.35,
        draw: 0.28,
        away: 0.37
      },
      participants: [
        { name: "Manchester United", meta: { location: "home" } },
        { name: "Liverpool", meta: { location: "away" } }
      ]
    },
    {
      fixture_id: 2,
      name: "Arsenal vs Chelsea",
      starting_at: "2024-01-16T19:45:00Z",
      probabilities: {
        home: 0.42,
        draw: 0.31,
        away: 0.27
      },
      participants: [
        { name: "Arsenal", meta: { location: "home" } },
        { name: "Chelsea", meta: { location: "away" } }
      ]
    },
    {
      fixture_id: 3,
      name: "Barcelona vs Real Madrid",
      starting_at: "2024-01-17T21:00:00Z",
      probabilities: {
        home: 0.38,
        draw: 0.29,
        away: 0.33
      },
      participants: [
        { name: "Barcelona", meta: { location: "home" } },
        { name: "Real Madrid", meta: { location: "away" } }
      ]
    }
  ]
};

export const mockValueBets = {
  data: [
    {
      fixture_id: 1,
      name: "Manchester United vs Liverpool",
      starting_at: "2024-01-15T20:00:00Z",
      value_bet: {
        type: "2",
        odds: 2.75,
        probability: 0.37,
        value: 0.15
      },
      participants: [
        { name: "Manchester United", meta: { location: "home" } },
        { name: "Liverpool", meta: { location: "away" } }
      ]
    },
    {
      fixture_id: 2,
      name: "Arsenal vs Chelsea",
      starting_at: "2024-01-16T19:45:00Z",
      value_bet: {
        type: "1",
        odds: 2.10,
        probability: 0.42,
        value: 0.08
      },
      participants: [
        { name: "Arsenal", meta: { location: "home" } },
        { name: "Chelsea", meta: { location: "away" } }
      ]
    }
  ]
};

export const mockLiveFixtures = {
  data: [
    {
      fixture_id: 1,
      name: "Manchester City vs Tottenham",
      starting_at: "2024-01-15T19:30:00Z",
      scores: {
        home: 2,
        away: 1
      },
      time: {
        minute: 67,
        second: 30
      },
      participants: [
        { name: "Manchester City", meta: { location: "home" } },
        { name: "Tottenham", meta: { location: "away" } }
      ]
    },
    {
      fixture_id: 2,
      name: "Bayern Munich vs Dortmund",
      starting_at: "2024-01-15T20:15:00Z",
      scores: {
        home: 1,
        away: 1
      },
      time: {
        minute: 23,
        second: 45
      },
      participants: [
        { name: "Bayern Munich", meta: { location: "home" } },
        { name: "Dortmund", meta: { location: "away" } }
      ]
    }
  ]
};

export const mockCountries = [
  {
    id: 1,
    name: "England",
    official_name: "United Kingdom of Great Britain and Northern Ireland",
    fifa_name: "ENG",
    iso2: "GB",
    iso3: "GBR",
    image_path: "https://media.api-sports.io/flags/gb.svg",
    continent: {
      id: 1,
      name: "Europe",
      code: "EU"
    },
    leagues: [
      { id: 1, name: "Premier League", type: "League" },
      { id: 2, name: "Championship", type: "League" },
      { id: 3, name: "FA Cup", type: "Cup" }
    ]
  },
  {
    id: 2,
    name: "Spain",
    official_name: "Kingdom of Spain",
    fifa_name: "ESP",
    iso2: "ES",
    iso3: "ESP",
    image_path: "https://media.api-sports.io/flags/es.svg",
    continent: {
      id: 1,
      name: "Europe",
      code: "EU"
    },
    leagues: [
      { id: 4, name: "La Liga", type: "League" },
      { id: 5, name: "Copa del Rey", type: "Cup" }
    ]
  },
  {
    id: 3,
    name: "Germany",
    official_name: "Federal Republic of Germany",
    fifa_name: "GER",
    iso2: "DE",
    iso3: "DEU",
    image_path: "https://media.api-sports.io/flags/de.svg",
    continent: {
      id: 1,
      name: "Europe",
      code: "EU"
    },
    leagues: [
      { id: 6, name: "Bundesliga", type: "League" },
      { id: 7, name: "DFB Pokal", type: "Cup" }
    ]
  },
  {
    id: 4,
    name: "Italy",
    official_name: "Italian Republic",
    fifa_name: "ITA",
    iso2: "IT",
    iso3: "ITA",
    image_path: "https://media.api-sports.io/flags/it.svg",
    continent: {
      id: 1,
      name: "Europe",
      code: "EU"
    },
    leagues: [
      { id: 8, name: "Serie A", type: "League" },
      { id: 9, name: "Coppa Italia", type: "Cup" }
    ]
  },
  {
    id: 5,
    name: "France",
    official_name: "French Republic",
    fifa_name: "FRA",
    iso2: "FR",
    iso3: "FRA",
    image_path: "https://media.api-sports.io/flags/fr.svg",
    continent: {
      id: 1,
      name: "Europe",
      code: "EU"
    },
    leagues: [
      { id: 10, name: "Ligue 1", type: "League" },
      { id: 11, name: "Coupe de France", type: "Cup" }
    ]
  },
  {
    id: 6,
    name: "Brazil",
    official_name: "Federative Republic of Brazil",
    fifa_name: "BRA",
    iso2: "BR",
    iso3: "BRA",
    image_path: "https://media.api-sports.io/flags/br.svg",
    continent: {
      id: 2,
      name: "South America",
      code: "SA"
    },
    leagues: [
      { id: 12, name: "Brasileirão", type: "League" },
      { id: 13, name: "Copa do Brasil", type: "Cup" }
    ]
  },
  {
    id: 7,
    name: "Argentina",
    official_name: "Argentine Republic",
    fifa_name: "ARG",
    iso2: "AR",
    iso3: "ARG",
    image_path: "https://media.api-sports.io/flags/ar.svg",
    continent: {
      id: 2,
      name: "South America",
      code: "SA"
    },
    leagues: [
      { id: 14, name: "Primera División", type: "League" },
      { id: 15, name: "Copa Argentina", type: "Cup" }
    ]
  },
  {
    id: 8,
    name: "United States",
    official_name: "United States of America",
    fifa_name: "USA",
    iso2: "US",
    iso3: "USA",
    image_path: "https://media.api-sports.io/flags/us.svg",
    continent: {
      id: 3,
      name: "North America",
      code: "NA"
    },
    leagues: [
      { id: 16, name: "MLS", type: "League" },
      { id: 17, name: "US Open Cup", type: "Cup" }
    ]
  }
]; 