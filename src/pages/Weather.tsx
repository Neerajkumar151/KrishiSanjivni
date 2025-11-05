import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Layout } from "@/components/layout/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Search,
  MapPin,
  AlertCircle,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/Footer";

interface WeatherData {
  location: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  pressure: number;
  visibility: number;
  sunrise: string;
  sunset: string;
  icon: string;
}

interface ForecastDay {
  date: string;
  temp_max: number;
  temp_min: number;
  description: string;
  icon: string;
}

export default function Weather() {
  const { t } = useTranslation();
  const [city, setCity] = useState("Delhi");
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const API_KEY = "895284fb2d2c50a520ea537456963d9c";

  const fetchWeather = async (cityName: string) => {
    setLoading(true);
    try {
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName},IN&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error("City not found");
      const currentData = await currentRes.json();

      setWeatherData({
        location: currentData.name,
        temperature: Math.round(currentData.main.temp),
        feels_like: Math.round(currentData.main.feels_like),
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        description: currentData.weather[0].description,
        pressure: currentData.main.pressure,
        visibility: currentData.visibility / 1000,
        sunrise: new Date(currentData.sys.sunrise * 1000).toLocaleTimeString(
          "en-IN",
          { hour: "2-digit", minute: "2-digit" }
        ),
        sunset: new Date(currentData.sys.sunset * 1000).toLocaleTimeString(
          "en-IN",
          { hour: "2-digit", minute: "2-digit" }
        ),
        icon: currentData.weather[0].icon,
      });

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName},IN&appid=${API_KEY}&units=metric`
      );
      const forecastData = await forecastRes.json();

      const dailyForecasts: ForecastDay[] = [];
      const processedDates = new Set();
      forecastData.list.forEach((item: any) => {
        const date = new Date(item.dt * 1000).toLocaleDateString("en-IN", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        if (!processedDates.has(date) && dailyForecasts.length < 7) {
          processedDates.add(date);
          dailyForecasts.push({
            date,
            temp_max: Math.round(item.main.temp_max),
            temp_min: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon,
          });
        }
      });
      setForecast(dailyForecasts);
      toast.success(t("weather.toastSuccess", { city: currentData.name }));
    } catch (error) {
      console.error(error);
      toast.error(t("weather.toastFail"));
    } finally {
      setLoading(false);
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      toast.error(t("weather.geoNotSupported"));
      return;
    }

    toast(t("weather.detectingLocation"));
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setLoading(true);
        try {
          const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          if (!currentRes.ok)
            throw new Error("Unable to fetch weather for your location");
          const currentData = await currentRes.json();

          setWeatherData({
            location: currentData.name,
            temperature: Math.round(currentData.main.temp),
            feels_like: Math.round(currentData.main.feels_like),
            humidity: currentData.main.humidity,
            wind_speed: currentData.wind.speed,
            description: currentData.weather[0].description,
            pressure: currentData.main.pressure,
            visibility: currentData.visibility / 1000,
            sunrise: new Date(
              currentData.sys.sunrise * 1000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            sunset: new Date(
              currentData.sys.sunset * 1000
            ).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            icon: currentData.weather[0].icon,
          });

          const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          );
          const forecastData = await forecastRes.json();

          const dailyForecasts: ForecastDay[] = [];
          const processedDates = new Set();
          forecastData.list.forEach((item: any) => {
            const date = new Date(item.dt * 1000).toLocaleDateString("en-IN", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
            if (!processedDates.has(date) && dailyForecasts.length < 7) {
              processedDates.add(date);
              dailyForecasts.push({
                date,
                temp_max: Math.round(item.main.temp_max),
                temp_min: Math.round(item.main.temp_min),
                description: item.weather[0].description,
                icon: item.weather[0].icon,
              });
            }
          });
          setForecast(dailyForecasts);
          toast.success(
            t("weather.toastDetected", { city: currentData.name })
          );
        } catch (error) {
          console.error(error);
          toast.error(t("weather.toastFail"));
        } finally {
          setLoading(false);
        }
      },
      () => {
        toast.error(t("weather.permissionDenied"));
      }
    );
  };

  useEffect(() => {
    fetchWeather("Delhi");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim()) fetchWeather(city);
  };

  const getWeatherIcon = (iconCode: string) =>
    `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white py-12 transition-all duration-500">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-blue-500 via-cyan-400 to-indigo-500 bg-clip-text text-transparent animate-gradient-x">
              {t("weather.title")}
            </h1>
            <p className="text-gray-500 text-lg">{t("weather.subtitle")}</p>
          </div>

          {/* Search */}
          <Card className="mb-8 shadow-lg rounded-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <CardContent className="pt-6">
              <form onSubmit={handleSearch} className="flex gap-4">
                <div className="relative flex-1">
                  <MapPin
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={handleLocation}
                  />
                  <Input
                    placeholder={t("weather.searchPlaceholder")}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="pl-10 rounded-lg"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:scale-105 transition-transform duration-300 text-white"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {loading ? t("weather.loading") : t("weather.search")}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Current Weather */}
          {weatherData && (
            <Card className="mb-8 shadow-xl border border-gray-100 rounded-2xl overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle>
                  {t("weather.currentWeatherTitle", {
                    location: weatherData.location,
                  })}
                </CardTitle>
                <CardDescription>{t("weather.currentWeatherDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="flex items-center gap-6 bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl shadow-lg">
                    <img
                      src={getWeatherIcon(weatherData.icon)}
                      alt={weatherData.description}
                      className="w-28 h-28 drop-shadow-xl"
                    />
                    <div>
                      <div className="text-6xl font-bold">
                        {weatherData.temperature}°C
                      </div>
                      <p className="text-lg text-gray-500 capitalize mt-2">
                        {weatherData.description}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {t("weather.feelsLike", {
                          value: weatherData.feels_like,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { icon: Droplets, label: t("weather.humidity"), value: `${weatherData.humidity}%` },
                      { icon: Wind, label: t("weather.wind"), value: `${weatherData.wind_speed} m/s` },
                      { icon: Gauge, label: t("weather.pressure"), value: `${weatherData.pressure} hPa` },
                      { icon: Eye, label: t("weather.visibility"), value: `${weatherData.visibility} km` },
                      { icon: Sunrise, label: t("weather.sunrise"), value: weatherData.sunrise },
                      { icon: Sunset, label: t("weather.sunset"), value: weatherData.sunset }
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white p-4 rounded-xl shadow hover:shadow-lg transition-all"
                      >
                        <item.icon className="h-5 w-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-gray-400">{item.label}</p>
                          <p className="font-semibold">{item.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <Card className="shadow-xl rounded-2xl border border-gray-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <CardTitle>{t("weather.forecastTitle")}</CardTitle>
                <CardDescription>{t("weather.forecastDesc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  {forecast.map((day, index) => (
                    <Card
                      key={index}
                      className="text-center rounded-xl shadow hover:shadow-2xl transition-all p-4 bg-gradient-to-b from-white to-blue-50"
                    >
                      <CardContent className="pt-4">
                        <p className="font-semibold text-sm mb-2">{day.date}</p>
                        <img
                          src={getWeatherIcon(day.icon)}
                          alt={day.description}
                          className="w-16 h-16 mx-auto drop-shadow-md"
                        />
                        <p className="text-xs text-gray-500 capitalize mb-2">
                          {day.description}
                        </p>
                        <div className="flex justify-center gap-2 text-sm">
                          <span className="font-semibold">{day.temp_max}°</span>
                          <span className="text-gray-400">{day.temp_min}°</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weather Advisory */}
          <Alert className="mt-8 rounded-xl bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 shadow-lg">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-600">
              {t("weather.alertTitle")}
            </AlertTitle>
            <AlertDescription className="text-red-500">
              {t("weather.alertDescription")}
            </AlertDescription>
          </Alert>
        </div>
      </div>
      <Footer />
    </Layout>
  );
}
