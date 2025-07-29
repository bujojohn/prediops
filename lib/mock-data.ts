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