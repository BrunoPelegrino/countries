const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/available-countries', async (req, res) => {
  try {
    const response = await axios.get('https://date.nager.at/api/v3/AvailableCountries');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching available countries:', error.message);
    res.status(500).json({ error: 'Failed to fetch available countries' });
  }
});

router.get('/country-info/:countryCode', async (req, res) => {
  const countryCode = req.params.countryCode;

  try {

    
    const bordersResponse = await axios.get(`https://date.nager.at/api/v3/CountryInfo/${countryCode}`);

    const borderCountries = bordersResponse.data.borders || [];

    const populationResponse = await axios.get('https://countriesnow.space/api/v0.1/countries/population', {
      params: { country: countryCode }
    });


    const populationData = populationResponse.data || {};
    const flagResponse = await axios.get('https://countriesnow.space/api/v0.1/countries/flag/images');

    let flags = [];
    if (Array.isArray(flagResponse.data)) {
      flags = flagResponse.data;
    } else if (flagResponse.data && flagResponse.data.data) {
      flags = flagResponse.data.data;
    } else if (flagResponse.data && flagResponse.data.flags) {
      flags = flagResponse.data.flags;
    }

    const flagImage = flags.find(country => country.iso2 === countryCode)?.flag || '';


    res.json({
      borders: borderCountries,
      population: populationData,
      flag: flagImage
    });
  } catch (error) {
    console.error('Error fetching country info:', error.message);
    res.status(500).json({ error: 'Failed to fetch country info' });
  }
});

module.exports = router;
