import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiOutlineLocationMarker, HiOutlineSearch } from 'react-icons/hi';
import { FiSun, FiMoon } from 'react-icons/fi';
import { useWeatherQuery } from '../hook/useWeatherQuery';
import { useWeatherForecast } from '../hook/useForecastQuery';
import { ThemeContext } from '../context/ThemeContext.jsx';
import { IoLocationOutline, IoSearch } from 'react-icons/io5';
import { MdOutlineLocationOn } from 'react-icons/md';

const apiKey = '8e054301b414c30658404433f16aa68c';

const weatherIcons = {
  Clear: 'clear.svg',
  Clouds: 'clouds.svg',
  Mist: 'mist.svg',
  Rain: 'rain.svg',
  Snow: 'snow.svg',
  Thunder: 'thunder.svg',
  Haze: 'mist.svg',
};

const getDayName = (date) => {
  return date.toLocaleDateString('en-US', { weekday: 'short' });
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 120 
    }
  },
  exit: { 
    y: -20, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

const fadeVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const WeatherIcon = ({ condition, description, className = '' }) => {
  const iconFile = weatherIcons[condition] || 'no-result.svg';
  const iconSrc = `/icons/${iconFile}`;
  
  return (
    <motion.img
      src={iconSrc}
      alt={description}
      className={`weather-icon ${className}`}
      aria-label={`Weather condition: ${description}`}
      initial={{ y: -50, opacity: 0 }}     
      animate={{ y: 0, opacity: 1 }}  
      transition={{ type: "spring", stiffness: 200 }}
    />
  );
};

const ForecastItem = ({ day, temp, condition, description }) => {
  return (
    <motion.li 
      className='forecast-item'
      variants={itemVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      tabIndex={0}
      aria-label={`${day}: ${description}, ${temp}°C`}
    >
      <p className='day'>{day}</p>
      <WeatherIcon 
        condition={condition} 
        description={description} 
        className="small-icon" 
      />
      <p className='temperature'>{temp}°</p>
    </motion.li>
  );
};


const LoadingSpinner = ({ size = 'medium' }) => (
  <motion.div
    className={`spinner ${size === 'small' ? 'small-spinner' : ''}`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    aria-label="Loading"
  />
);


const ErrorMessage = ({ message }) => (
  <motion.div
    className="error-message"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    role="alert"
    aria-live="assertive"
  >
    {message}
  </motion.div>
);

const SearchSection = () => {
  const [city, setCity] = useState('Tashkent');
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const { theme, toggleTheme } = useContext(ThemeContext);
  
  const { data, isLoading, error } = useWeatherQuery(city, apiKey);
  const { data: forecastData } = useWeatherForecast(city, apiKey);
  
  const handleCitySearch = (e) => {
    e.preventDefault();
    const value = e.target.elements.city.value;
    setCity(value);
    setLocationError(null);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    setLocationError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          const reverseGeocodeUrl = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${apiKey}`;
          const response = await fetch(reverseGeocodeUrl);
          
          if (!response.ok) {
            throw new Error('Location not found');
          }
          
          const locationData = await response.json();
          if (locationData && locationData.length > 0) {
            const newCity = locationData[0].name;
            setCity(newCity);
            setLocationError(null);
          } else {
            throw new Error('City not found for your location');
          }
        } catch (err) {
          setLocationError(err.message);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setLocationError(err.message || "Failed to get your location");
        setIsLocating(false);
      }
    );
  };

  const dailyForecast = [];
  if (forecastData) {
    const seenDays = new Set();
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.getDate();
      
      if (!seenDays.has(day) && seenDays.size < 5) {
        seenDays.add(day);
        dailyForecast.push({
          day: getDayName(date),
          temp: Math.round(item.main.temp - 273.15),
          condition: item.weather[0].main,
          description: item.weather[0].description
        });
      }
    });
  }

  return (
    <div className={`app-container ${theme}`}>
      
      <header className="app-header">
      
        
        <motion.button 
          className={`theme-toggle ${theme}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {theme === 'light' ? <FiMoon size={24} /> : <FiSun size={24} />}
        </motion.button>
      </header>

      <div className='search-section'>
        
        <form 
        
          className='search-form' 
          onSubmit={handleCitySearch}
          aria-label="Search for a city"
        >
          
          <div className={`search-input-container  ${theme}`}>
            
            <IoSearch  className={`search-svg  ${theme}`}  aria-hidden="true" />
            <motion.input
              type="search"
              placeholder='Enter a city name'
              className={`search-input  ${theme}`}
              name='city'
              required
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              aria-required="true"
              aria-label="City name"
            />
          </div>
        </form>
        <motion.button 
          className={`location-button ${theme}`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={getCurrentLocation}
          disabled={isLocating}
          aria-label="Get current location weather"
        >
          {isLocating ? (
            <LoadingSpinner size="small" />
          ) : (
            <MdOutlineLocationOn className={`search-svg  ${theme}`} aria-hidden="true" />
          )}
          
        </motion.button>
      </div>
      
      {locationError && (
        <ErrorMessage message={locationError} />
      )}
      
      <AnimatePresence mode='wait'>
        {isLoading && (
          <motion.div
            className="loading-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
          >
            <LoadingSpinner />
          </motion.div>
        )}
        
        {error && (
          <ErrorMessage message={error.message} />
        )}
        
        {data && (
          <motion.div
            key={city + '-weather'}
            className='weather-section'
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >
            <motion.div 
              className='current-weather' 
              variants={fadeVariants}
              aria-labelledby="current-weather-heading"
            >
              <WeatherIcon 
                condition={data.weather[0].main} 
                description={data.weather[0].description} 
              />
              
              <motion.div variants={itemVariants}>
                <h2 id="current-weather-heading">{data.name}</h2>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <h2 className='temperature'>
                  {Math.round(data.main.temp - 273.15)}<span>°C</span>
                </h2>
              </motion.div>
              
              <motion.p 
                className='description'
                variants={itemVariants}
              >
                {data.weather[0].description}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {dailyForecast.length > 0 && (
        <motion.section 
          className='daily-forecast'
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          aria-labelledby="forecast-heading" 
        >
          <motion.ul 
            className='forecast-list'
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            
            <AnimatePresence>
              {dailyForecast.map((day, index) => (
                <ForecastItem
                  key={`${day.day}-${index}`}
                  day={day.day}
                  temp={day.temp}
                  condition={day.condition}
                  description={day.description}
                />
                
              ))}
            </AnimatePresence>
          </motion.ul>
        </motion.section>
      )}
    </div>
  );
};

export default SearchSection;