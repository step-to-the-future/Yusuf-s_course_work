import './App.css'
import { ThemeProvider } from './context/ThemeContext.jsx';
import SearchSection from './components/SearchSection.jsx';

function App() {
  
  return (
    <>
    <div className='container'>
      <ThemeProvider>
        <SearchSection />
      </ThemeProvider>
      <div className='weather-section'>
      </div>
    </div>     
    </>
  )
}

export default App
