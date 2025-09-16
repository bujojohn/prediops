# Fixture List with Prediction Probabilities – Responsive Specification

## 1. Fixture Card Layout (Responsive)

Use a responsive layout that adapts gracefully across breakpoints:
- **Mobile (compact=true)**: Stacked card layout for clarity with larger touch targets.
- **Desktop (compact=false)**: Four-column grid layout matching the reference image design.

### Desktop Layout (≥640px) - Four Column Design
- **Column 1**: Status/Time (Live indicator or date/time)
- **Column 2**: Teams (Team A on row 1, Team B on row 2)
- **Column 3**: Scores (Home score on row 1, Away score on row 2)
- **Column 4**: Prediction Probabilities (Market description + probability buttons)

### Mobile Layout (<640px) - Stacked Design
- Header with state/time and date
- Teams with scores in center
- League information
- Prediction markets in grid layout

---

- **State & Date**
  - **Desktop**: Column 1 shows live indicator (red dot + "Live") for live matches, or date/time for scheduled matches
  - **Mobile**: Left shows match state (`14:30`, `57'`, `HT`, `FT`, etc.), right shows fixture date
- **States** (from Sportmonks data):  
  - **Scheduled** → Start time (`HH:mm`)  
  - **In-play** → Current minute (`45+2'`)  
  - **Half-time** → `HT` or `Break`  
  - **Full-time** → `FT` or `Finished`  
  - Other states (e.g., *Postponed*, *Cancelled*) → As provided.  

---

- **Teams**
  - **Desktop**: Column 2 shows Team A (row 1) and Team B (row 2) with small team logos
  - **Mobile**: Home and away team name & logo; stacked on small screens, aligned horizontally on larger screens.
  - Interactions: click opens Head‑to‑Head popup; hover highlights both teams.

---

- **Scores / Results**
  - **Desktop**: Column 3 shows Home score (row 1) and Away score (row 2) in blue
  - **Mobile**: Inline with teams on small screens; centered row on larger screens.
  - Live updates without page reload.

---

- **Prediction Probability Market**
  - **Desktop**: Column 4 shows market description (row 1) and probability buttons (row 2)
  - **Mobile**: Market title above button group in grid layout.
  - Button format: left = market symbol (`1`, `x`, `2`), right = probability percentage.
  - ChevronDown icon for market selection when multiple markets available.
- **Example – Full Time Result ("1 X 2")**:  
  - `1   10.4%`  
  - `x   44%`  
  - `2   36%`  

---

## 2. Grouping & Collapsing Fixtures
- Group fixtures under headers (e.g., competition, date).
- Header is a full-width interactive row with collapse/expand affordance.
- **Fixture Count Button**: Shows the number of fixtures in each group (e.g., "England - Premier League [14]")
- **Date Demarcation**: Semantic dates (Today, Tomorrow, 14th Aug) appear above groups as demarcation points
- **League Grouping**: All fixtures in a card must belong to the same league/tournament

---

### 2.1 Market Selection per Fixture
- Icon button next to market title opens selection (dropdown/sheet depending on screen size).

---

## 3. Data Fetching (Examples)

### 3.1.1 Prediction Page
- **Endpoint**:  
    /fixtures (with `filters=todayDate`)

- **API Configuration**:  
```javascript
ApiConfig = {
  include: 'participants;scores;state;predictions.type;league',
  sortBy: 'starting_at',
  order: 'desc',
  filters: 'todayDate',
  per_page: 50,
};

- **Pagination / UX**:
  - Initial page is server-rendered.
  - Additional pages are loaded via infinite scroll as the user reaches the end of the list.
```

### 3.1.2 Live Matches Page
- **Endpoint**:  
    /livescores/inplay

- **API Configuration**:  
```javascript
ApiConfig = {
  include: 'participants;scores;state;predictions.type',
  sortBy: 'starting_at',
  order: 'desc',
  filters: 'inplay',
  per_page: 50,
};
```
### 3.2.1 to 3.1.2 Sample Api Data
for endpoints 3.1.1 and 3.1.2
```json
{
    "data": [
        {
            "id": 19432803,
            "sport_id": 1,
            "league_id": 14,
            "season_id": 25650,
            "stage_id": 77476919,
            "group_id": null,
            "aggregate_id": null,
            "round_id": 372842,
            "state_id": 2,
            "venue_id": 838,
            "name": "Notts County vs Salford City",
            "starting_at": "2025-08-09 11:30:00",
            "result_info": null,
            "leg": "1/1",
            "details": null,
            "length": 90,
            "placeholder": false,
            "has_odds": true,
            "has_premium_odds": true,
            "starting_at_timestamp": 1754739000,
            "participants": [
                {
                    "id": 98,
                    "sport_id": 1,
                    "country_id": 462,
                    "venue_id": 838,
                    "gender": "male",
                    "name": "Notts County",
                    "short_code": "NOT",
                    "image_path": "https://cdn.sportmonks.com/images/soccer/teams/2/98.png",
                    "founded": 1862,
                    "type": "domestic",
                    "placeholder": false,
                    "last_played_at": "2025-08-02 15:00:00",
                    "meta": {
                        "location": "home",
                        "winner": null,
                        "position": 10
                    }
                },
                {
                    "id": 129,
                    "sport_id": 1,
                    "country_id": 462,
                    "venue_id": 232148,
                    "gender": "male",
                    "name": "Salford City",
                    "short_code": "SAL",
                    "image_path": "https://cdn.sportmonks.com/images/soccer/teams/1/129.png",
                    "founded": 0,
                    "type": "domestic",
                    "placeholder": false,
                    "last_played_at": "2025-08-02 14:00:00",
                    "meta": {
                        "location": "away",
                        "winner": null,
                        "position": 22
                    }
                }
            ],
            "predictions": [
                {
                    "id": 21785108,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 55.56,
                        "no": 44.44
                    },
                    "type_id": 231
                },
                {
                    "id": 21785135,
                    "fixture_id": 19432803,
                    "predictions": {
                        "home": 49.13,
                        "away": 44.6,
                        "draw": 6.27
                    },
                    "type_id": 238
                },
                {
                    "id": 21785195,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 41.7,
                        "no": 58.3
                    },
                    "type_id": 332
                },
                {
                    "id": 21785124,
                    "fixture_id": 19432803,
                    "predictions": {
                        "home": 30.95,
                        "away": 28.42,
                        "draw": 40.63
                    },
                    "type_id": 233
                },
                {
                    "id": 21785215,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 69.77,
                        "no": 19.87,
                        "equal": 10.36
                    },
                    "type_id": 1686
                },
                {
                    "id": 21785206,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 94.03,
                        "no": 2.56,
                        "equal": 3.41
                    },
                    "type_id": 1690
                },
                {
                    "id": 21785222,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 34.92,
                        "no": 53.89,
                        "equal": 11.18
                    },
                    "type_id": 1688
                },
                {
                    "id": 21785226,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 25.26,
                        "no": 65.08,
                        "equal": 9.66
                    },
                    "type_id": 1684
                },
                {
                    "id": 21785160,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 54.14,
                        "no": 45.86
                    },
                    "type_id": 235
                },
                {
                    "id": 21785202,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 6.47,
                        "no": 93.53
                    },
                    "type_id": 327
                },
                {
                    "id": 21785213,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 80.13,
                        "no": 11.67,
                        "equal": 8.2
                    },
                    "type_id": 1685
                },
                {
                    "id": 21785190,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 73.2,
                        "no": 26.8
                    },
                    "type_id": 333
                },
                {
                    "id": 21785169,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 18.43,
                        "no": 81.57
                    },
                    "type_id": 1679
                },
                {
                    "id": 21785173,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 68.8,
                        "no": 31.2
                    },
                    "type_id": 334
                },
                {
                    "id": 21785178,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 36.4,
                        "no": 63.6
                    },
                    "type_id": 331
                },
                {
                    "id": 21785181,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 15.02,
                        "no": 84.98
                    },
                    "type_id": 330
                },
                {
                    "id": 21785185,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 5.37,
                        "no": 94.63
                    },
                    "type_id": 326
                },
                {
                    "id": 21785208,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 88.33,
                        "no": 5.97,
                        "equal": 5.7
                    },
                    "type_id": 1683
                },
                {
                    "id": 21785146,
                    "fixture_id": 19432803,
                    "predictions": {
                        "scores": {
                            "0-0": 6.27,
                            "0-1": 8.96,
                            "0-2": 6.41,
                            "0-3": 3.22,
                            "1-0": 7.8,
                            "1-1": 11.4,
                            "1-2": 8.93,
                            "1-3": 4.27,
                            "2-0": 5.01,
                            "2-1": 7.67,
                            "2-2": 5.67,
                            "2-3": 3.03,
                            "3-0": 2.48,
                            "3-1": 3.47,
                            "3-2": 2.56,
                            "3-3": 1.14,
                            "Other_1": 5.23,
                            "Other_2": 6.33,
                            "Other_X": 0.14
                        }
                    },
                    "type_id": 240
                },
                {
                    "id": 21785165,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 31.85,
                        "no": 68.15
                    },
                    "type_id": 236
                },
                {
                    "id": 21785225,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 34.92,
                        "no": 65.08,
                        "equal": null
                    },
                    "type_id": 1585
                },
                {
                    "id": 21785197,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 18.13,
                        "no": 81.87
                    },
                    "type_id": 328
                },
                {
                    "id": 21785116,
                    "fixture_id": 19432803,
                    "predictions": {
                        "home_home": 21.84,
                        "home_away": 2.54,
                        "home_draw": 5.05,
                        "away_home": 2.78,
                        "away_away": 22.17,
                        "away_draw": 4.67,
                        "draw_draw": 14.56,
                        "draw_home": 13.3,
                        "draw_away": 13.09
                    },
                    "type_id": 232
                },
                {
                    "id": 21785130,
                    "fixture_id": 19432803,
                    "predictions": {
                        "home": 34.22,
                        "away": 41.15,
                        "draw": 24.63
                    },
                    "type_id": 237
                },
                {
                    "id": 21785139,
                    "fixture_id": 19432803,
                    "predictions": {
                        "draw_home": 58.849999999999994,
                        "draw_away": 65.78,
                        "home_away": 75.37
                    },
                    "type_id": 239
                },
                {
                    "id": 21785152,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 76.96,
                        "no": 23.04
                    },
                    "type_id": 234
                },
                {
                    "id": 21785221,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 46.11,
                        "no": 41.93,
                        "equal": 11.96
                    },
                    "type_id": 1687
                },
                {
                    "id": 21785218,
                    "fixture_id": 19432803,
                    "predictions": {
                        "yes": 58.07,
                        "no": 30.23,
                        "equal": 11.7
                    },
                    "type_id": 1689
                }
            ],
            "scores": [
                {
                    "id": 16754411,
                    "fixture_id": 19432803,
                    "type_id": 1525,
                    "participant_id": 129,
                    "score": {
                        "goals": 1,
                        "participant": "away"
                    },
                    "description": "CURRENT"
                },
                {
                    "id": 16754414,
                    "fixture_id": 19432803,
                    "type_id": 1,
                    "participant_id": 129,
                    "score": {
                        "goals": 1,
                        "participant": "away"
                    },
                    "description": "1ST_HALF"
                },
                {
                    "id": 16754417,
                    "fixture_id": 19432803,
                    "type_id": 2,
                    "participant_id": 129,
                    "score": {
                        "goals": 1,
                        "participant": "away"
                    },
                    "description": "2ND_HALF"
                },
                {
                    "id": 16754416,
                    "fixture_id": 19432803,
                    "type_id": 2,
                    "participant_id": 98,
                    "score": {
                        "goals": 0,
                        "participant": "home"
                    },
                    "description": "2ND_HALF"
                },
                {
                    "id": 16754410,
                    "fixture_id": 19432803,
                    "type_id": 1525,
                    "participant_id": 98,
                    "score": {
                        "goals": 0,
                        "participant": "home"
                    },
                    "description": "CURRENT"
                },
                {
                    "id": 16754413,
                    "fixture_id": 19432803,
                    "type_id": 1,
                    "participant_id": 98,
                    "score": {
                        "goals": 0,
                        "participant": "home"
                    },
                    "description": "1ST_HALF"
                }
            ],
            "state": {
                "id": 2,
                "state": "INPLAY_1ST_HALF",
                "name": "1st Half",
                "short_name": "1st",
                "developer_name": "INPLAY_1ST_HALF"
            }
        
    ],
    "subscription": [
        {
            "meta": {
                "trial_ends_at": null,
                "ends_at": "2025-08-26 19:57:27",
                "current_timestamp": 1754741464
            },
            "plans": [
                {
                    "plan": "Worldwide Plan",
                    "sport": "Football",
                    "category": "Basic"
                }
            ],
            "add_ons": [
                {
                    "add_on": "Worldwide Plan Predictions",
                    "sport": "Football",
                    "category": "Predictions"
                },
                {
                    "add_on": "Match Facts Advanced - Trialing until 2025-11-01 08:40:24",
                    "sport": "Football",
                    "category": "Match facts"
                }
            ],
            "widgets": []
        }
    ],
    "rate_limit": {
        "resets_in_seconds": 3475,
        "remaining": 2998,
        "requested_entity": "Fixture"
    },
    "timezone": "UTC"
}
```


## 4. Interaction & Accessibility
- Minimum touch target height: 44px.
- Keyboard and screen‑reader friendly controls and labels.
- Smooth expand/collapse animations; no layout shift.

## 5. Display Settings
- **Team Image Toggle**: Users can show/hide team logos via the settings toggle in the navbar
- **Font Size**: Consistent 12px font size across all fixture elements
- **Live Score Updates**: Real-time score updates for live matches every 30 seconds

## 6. Performance & Real-time Features
- **Live Score Polling**: Automatic updates for live matches every 30 seconds
- **Optimized Rendering**: Efficient re-rendering only when scores change
- **Error Handling**: Graceful fallback when live score updates fail
- **Virtual Scrolling**: Efficient handling of large fixture lists
- **Error Boundaries**: Graceful error handling for individual fixture cards
- **Loading States**: Visual feedback during live score updates

## 7. Accessibility & UX
- **ARIA Labels**: Proper accessibility labels for prediction buttons and market selection
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Semantic HTML structure for screen readers
- **Loading Indicators**: Clear visual feedback during data updates
- **Error Recovery**: Graceful error handling with user-friendly messages