import { z } from "zod";

export const WeatherReportSchema = z
  .object({
    temperature_celcius: z.number().nullable().optional(),
    temperature_fahrenheit: z.number().nullable().optional(),
    wind_speed: z.number().nullable().optional(),
    wind_speed_miles: z.number().nullable().optional(),
    wind_direction: z.string().nullable().optional(),
    weather_condition: z.string().nullable().optional(),
    weather_description: z.string().nullable().optional(),
    humidity: z.number().nullable().optional(),
    pressure: z.number().nullable().optional(),
    cloud_cover: z.number().nullable().optional(),
    precipitation: z.number().nullable().optional(),
    snow: z.number().nullable().optional(),
    rain: z.number().nullable().optional(),
    icon: z.string().nullable().optional(),
    icon_path: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
    fixture_id: z.number().nullable().optional(),
    type: z.string().nullable().optional(),
  })
  .passthrough();

export type WeatherReport = z.infer<typeof WeatherReportSchema>;

