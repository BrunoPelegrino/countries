import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import '../styles/main.scss'; // Importando o arquivo de estilos

const CountryInfo = () => {
  const { code } = useParams();
  const [country, setCountry] = useState(null);
  const [borderCountries, setBorderCountries] = useState([]);
  const [populationData, setPopulationData] = useState([]);
  const [availableCountries, setAvailableCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableCountries = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/available-countries`);
        setAvailableCountries(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching available countries:", error);
        setLoading(false);
      }
    };

    fetchAvailableCountries();
  }, []);

  useEffect(() => {
    const fetchCountryInfo = async () => {
      if (availableCountries.length === 0) return;

      try {
        const countryExists = availableCountries.some(country => country.countryCode === code);

        if (countryExists) {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/country-info/${code}`);
          console.log(response);
          console.log(response.data.population.data[0].populationCounts[0].value);
          
          setCountry(response.data);
          setBorderCountries(response.data.borders);

          if (response.data.population.data.populationCounts) {
            setPopulationData(response.data.population.data[0].populationCounts[0].value);
          } else {
            console.error("Population data is not an array.");
          }
        } else {
          console.error("Country code not found in available countries.");
        }
      } catch (error) {
        console.error("Error fetching country info:", error);
      }
    };

    fetchCountryInfo();
  }, [code, availableCountries]);

  if (loading) return <div>Loading...</div>;
  if (!country) return <div>Loading...</div>;


  const years = populationData.map((data) => data.year);
  const populationCounts = populationData.map((data) => data.population);

  const chartData = {
    labels: years,
    datasets: [
      {
        label: 'Population Over Time',
        data: populationCounts,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="country-info container">
      <h1>{country.name}</h1>
      <img src={country.flag} alt={`${country.name} flag`} />

      <div className="border-countries">
        <h2>Border Countries</h2>
        <ul>
          {borderCountries.length === 0 ? <li>No border countries</li> : 
            borderCountries.map((border) => (
              <li key={border.countryCode}>
                <p>{border.name}</p>
              </li>
            ))}
        </ul>
      </div>

      <div className="chart-container">
        <h2>Population Data</h2>
        {populationCounts.length === 0 ? <div>No population data</div> : <Line data={chartData} />}
      </div>
    </div>
  );
};

export default CountryInfo;
