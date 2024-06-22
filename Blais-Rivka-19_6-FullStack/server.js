const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// פתיחת חיבור לבסיס הנתונים
const db = new sqlite3.Database('weather_app.db'); // חיבור למסד נתונים בקובץ

// יצירת טבלאות בבסיס הנתונים אם הן לא קיימות
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS weather (
            cityKey TEXT PRIMARY KEY,
            temperatureCelsius REAL,
            weatherText TEXT
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS favorites (
            userId TEXT,
            cityKey TEXT,
            LocalizedName TEXT,
            PRIMARY KEY (userId, cityKey)
        )
    `);
});

const YOUR_ACCUWEATHER_API_KEY = 'dumGX9LuNJzuPvvHq1235pnA89X2jDnW';

// חיפוש ערים
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    try {
        console.log('Searching for cities with query:', query);
        const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/autocomplete`, {
            params: {
                apikey: YOUR_ACCUWEATHER_API_KEY,
                q: query
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching cities from AccuWeather:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to fetch cities' });
    }
});

// קבלת מזג אוויר נוכחי
app.get('/api/currentWeather', async (req, res) => {
    const cityKey = req.query.cityKey;
    db.get(`SELECT temperatureCelsius, weatherText FROM weather WHERE cityKey = ?`, [cityKey], async (err, row) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (row) {
            res.json(row);
        } else {
            try {
                const response = await axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${cityKey}`, {
                    params: {
                        apikey: YOUR_ACCUWEATHER_API_KEY
                    }
                });
                const weatherData = {
                    cityKey: cityKey,
                    temperatureCelsius: response.data[0].Temperature.Metric.Value,
                    weatherText: response.data[0].WeatherText,

                };
                db.run(`INSERT OR REPLACE INTO weather (cityKey, temperatureCelsius, weatherText) VALUES (?, ?, ?)`, [cityKey, weatherData.temperatureCelsius, weatherData.weatherText], (err) => {
                    if (err) {
                        console.error('Error inserting weather data into database:', err);
                    }
                });
                res.json(weatherData);
            } catch (error) {
                console.error('Error fetching current weather from AccuWeather:', error.response ? error.response.data : error.message);
                res.status(500).json({ error: 'Failed to fetch current weather' });
            }
        }
    });
});

// הוספת עיר למועדפים
app.post('/api/addToFavorites', (req, res) => {
    const { userId, cityKey, cityName } = req.body;
    db.run(`INSERT OR REPLACE INTO favorites (userId, cityKey, LocalizedName) VALUES (?, ?, ?)`, [userId, cityKey, cityName], (err) => {
        if (err) {
            console.error('Error adding city to favorites:', err);
            res.status(500).json({ error: 'Failed to add to favorites' });
        } else {
            res.json({ message: 'City added to favorites' });
        }
    });
});

// מחיקת עיר מהמועדפים
app.post('/api/deleteFavorite', (req, res) => {
    const { userId, cityKey } = req.body;
    db.run(`DELETE FROM favorites WHERE userId = ? AND cityKey = ?`, [userId, cityKey], (err) => {
        if (err) {
            console.error('Error deleting city from favorites:', err);
            res.status(500).json({ error: 'Failed to delete from favorites' });
        } else {
            res.json({ message: 'City deleted from favorites' });
        }
    });
});

// חיפוש ערים מועדפות
app.get('/api/favorites/search/:userId', (req, res) => {
    const userId = req.params.userId;
    db.all(`SELECT cityKey, LocalizedName FROM favorites WHERE userId = ?`, [userId], (err, rows) => {
        if (err) {
            console.error('Database error:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }

        if (rows.length === 0) {
            res.json([]);
            return;
        }

        const promises = rows.map(row => {
            return axios.get(`http://dataservice.accuweather.com/currentconditions/v1/${row.cityKey}`, {
                params: {
                    apikey: YOUR_ACCUWEATHER_API_KEY
                }
            }).then(response => {
                return {
                    cityKey: row.cityKey,
                    LocalizedName: row.LocalizedName,
                    temperatureCelsius: response.data[0].Temperature.Metric.Value,
                    weatherText: response.data[0].WeatherText
                };
            }).catch(error => {
                console.error(`Error fetching current weather for cityKey ${row.cityKey} from AccuWeather:`, error.response ? error.response.data : error.message);
                return {
                    cityKey: row.cityKey,
                    LocalizedName: row.LocalizedName,
                    error: 'Failed to fetch current weather'
                };
            });
        });

        Promise.all(promises).then(results => {
            res.json(results);
        });
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
