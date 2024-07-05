const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "Tables1.db");

let db = null;
const initializeDbServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3005, () => {
      console.log("Server starts at localhost:3005");
    });
  } catch (e) {
    console.log(e.message);
  }
};
initializeDbServer();



app.get("/airport/:iata_code", async (request, response) => {
  const { iata_code } = request.params;
  console.log("Received iata_code:", iata_code);

  const getAirportQuery = `
    SELECT 
      airport.id as airport_id,
      airport.icao_code,
      airport.iata_code,
      airport.name as airport_name,
      airport.type as airport_type,
      airport.latitude_deg,
      airport.longitude_deg,
      airport.elevation_ft,
      airport.continent_id,
      airport.website_url,
      airport.created_at as airport_created_at,
      airport.updated_at as airport_updated_at,
      airport.wikipedia_link,
      city.id as city_id,
      city.name as city_name,
      city.country_id as city_country_id,
      city.is_active as city_is_active,
      city.lat as city_lat,
      city.long as city_long,
      city.alt_name as city_alt_name,
      city.created_at as city_created_at,
      city.updated_at as city_updated_at,
      country.id as country_id,
      country.name as country_name,
      country.country_code_two,
      country.country_code_three,
      country.mobile_code,
      country.continent_id as country_continent_id,
      country.country_flag,
      country.flag_app,
      country.alt_name as country_alt_name
    FROM 
      airport
      JOIN city ON airport.city_id = city.id
      LEFT JOIN country ON city.country_id = country.id
    WHERE 
      airport.iata_code = ?;
  `;

  try {
    console.log("Executing query:", getAirportQuery);
    const dbResponse = await db.get(getAirportQuery, [iata_code]);
    console.log("Database response:", dbResponse);

    if (!dbResponse) {
      return response.status(404).send({ error: "Airport not found" });
    }

    const result = {
      airport: {
        id: dbResponse.airport_id,
        icao_code: dbResponse.icao_code,
        iata_code: dbResponse.iata_code,
        name: dbResponse.airport_name,
        type: dbResponse.airport_type,
        latitude_deg: dbResponse.latitude_deg,
        longitude_deg: dbResponse.longitude_deg,
        elevation_ft: dbResponse.elevation_ft,
        continent_id: dbResponse.continent_id,
        website_url: dbResponse.website_url,
        created_at: dbResponse.airport_created_at,
        updated_at: dbResponse.airport_updated_at,
        wikipedia_link: dbResponse.wikipedia_link,
        address: {
          city: {
            id: dbResponse.city_id,
            name: dbResponse.city_name,
            alt_name: dbResponse.city_alt_name,
            country_id: dbResponse.city_country_id,
            is_active: dbResponse.city_is_active === 1,
            lat: dbResponse.city_lat,
            long: dbResponse.city_long,
            created_at: dbResponse.city_created_at,
            updated_at: dbResponse.city_updated_at,
          },
          country: dbResponse.country_id ? {
            id: dbResponse.country_id,
            name: dbResponse.country_name,
            country_code_two: dbResponse.country_code_two,
            country_code_three: dbResponse.country_code_three,
            mobile_code: dbResponse.mobile_code,
            continent_id: dbResponse.country_continent_id,
            country_flag: dbResponse.country_flag,
            flag_app: dbResponse.flag_app,
            alt_name: dbResponse.country_alt_name,
          } : null,
        },
      },
    };

    response.send(result);
  } catch (error) {
    response.status(500).send({ error: error.message });
  }
});

// Get all responses

app.get("/airport/", async (request, response) => {

    const getAirportQuery = `
      SELECT 
        airport.id as airport_id,
        airport.icao_code,
        airport.iata_code,
        airport.name as airport_name,
        airport.type as airport_type,
        airport.latitude_deg,
        airport.longitude_deg,
        airport.elevation_ft,
        airport.continent_id,
        airport.website_url,
        airport.created_at as airport_created_at,
        airport.updated_at as airport_updated_at,
        airport.wikipedia_link,
        city.id as city_id,
        city.name as city_name,
        city.country_id as city_country_id,
        city.is_active as city_is_active,
        city.lat as city_lat,
        city.long as city_long,
        city.alt_name as city_alt_name,
        city.created_at as city_created_at,
        city.updated_at as city_updated_at,
        country.id as country_id,
        country.name as country_name,
        country.country_code_two,
        country.country_code_three,
        country.mobile_code,
        country.continent_id as country_continent_id,
        country.country_flag,
        country.flag_app,
        country.alt_name as country_alt_name
      FROM 
        airport
        JOIN city ON airport.city_id = city.id
        LEFT JOIN country ON city.country_id = country.id;
    `;
  
    try {
      console.log("Executing query:", getAirportQuery);
      const dbResponse = await db.all(getAirportQuery);
      console.log("Database response:", dbResponse);
  
      if (!dbResponse) {
        return response.status(404).send({ error: "Airport not found" });
      }
      
  
      const result = dbResponse.map(row => ({
        airport: {
          id: row.airport_id,
          icao_code: row.icao_code,
          iata_code: row.iata_code,
          name: row.airport_name,
          type: row.airport_type,
          latitude_deg: row.latitude_deg,
          longitude_deg: row.longitude_deg,
          elevation_ft: row.elevation_ft,
          continent_id: row.continent_id,
          website_url: row.website_url,
          created_at: row.airport_created_at,
          updated_at: row.airport_updated_at,
          wikipedia_link: row.wikipedia_link,
          address: {
            city: {
              id: row.city_id,
              name: row.city_name,
              alt_name: row.city_alt_name,
              country_id: row.city_country_id,
              is_active: row.city_is_active === 1,
              lat: row.city_lat,
              long: row.city_long,
              created_at: row.city_created_at,
              updated_at: row.city_updated_at,
            },
            country: row.country_id ? {
              id: row.country_id,
              name: row.country_name,
              country_code_two: row.country_code_two,
              country_code_three: row.country_code_three,
              mobile_code: row.mobile_code,
              continent_id: row.country_continent_id,
              country_flag: row.country_flag,
              flag_app: row.flag_app,
              alt_name: row.country_alt_name,
            } : null,
          },
        },
      }));
  
      response.send(result);
    } catch (error) {
      response.status(500).send({ error: error.message });
    }
  });
  