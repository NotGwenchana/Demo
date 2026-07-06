import '../Css/HomePage.css'
import { Link } from 'react-router-dom';
import HomeContentlogo from '../assets/HomeContentlogo.png'

function HomePage() {
  return(
    <div className='home-page'>
      
      {/* Main Content */}
      <div className='content'>
        <h1>Welcome to Hungry Korean</h1>
        
        <img 
          src={HomeContentlogo} 
          alt="Delicious Korean Bibimbap" 
          className="home-food-image"
        />
        
        <p>
          Authentic Korean Food that is Fast and Fresh. 
          Food that has been prepared with a little bit of love and integrity 
          with no MSG or artificial ingredients.
        </p>
      </div>
      
      {/* Footer Links */}
      <div className="footer">
        <Link to="/terms" className="footer-link"> Terms and Conditions</Link>
        <Link to="/franchise" className="footer-link"> Become a Franchise Partner</Link>
      </div>
      
    </div>
  );
}

export default HomePage;