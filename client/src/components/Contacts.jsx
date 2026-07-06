import { Link } from 'react-router-dom';
import '../Css/Contacts.css';

function Contacts() {
  return (
    <div className="contacts-page">
      <div className="contacts-container">
        
        <h1>Our Locations</h1>
        
        {/* Contact Info */}
        <div className="contact-box">
          <p><strong>📧 Email:</strong> info@hungrykorean.com</p>
          <p><strong>📱 Delivery Platfomrs:</strong> Foodpanda / Keeta / OpenRice</p>
        </div>   
        
        <div className="locations-list">
          <div className="location">
            <h3>Causeway Bay</h3>
            <p>📍Shop D, G/F, Jardine Center, 50 Jardine's Bazaar</p>
            <p>📞 +852 2698 4777</p>
          </div>
          
          <div className="location">
            <h3>HOK 66 Pronto</h3>
            <p>📍Hong Kong MTR Station Shop 66, Level 1 Unpaid Area</p>
            <p>📞 +852 6698 3392</p>
          </div>
          
          <div className="location">
            <h3>HKUST Pronto</h3>
            <p>📍Asian Food Outlet 1/F, Chia-Wei Woo Academic Concourse HKUST</p>
            <p>📞 +852 2980 3900</p>
          </div>
          
          <div className="location">
            <h3>Kowloon Bay Amoy</h3>
            <p>📍Shop G113, G/F Phase 1, Amoy Plaza, 77 Ngau Tau Kok Road</p>
            <p>📞 +852 2662 1866</p>
          </div>
          
          <div className="location">
            <h3>Tseung Kwan O</h3>
            <p>📍Shop UG005, UG/F Metro City Phase II</p>
            <p>📞 +852 2505 6888</p>
          </div>
          
          <div className="location">
            <h3>Tsim Sha Tsui</h3>
            <p>📍Unit B, G/F Astoria Building, 24-38 Ashley Road</p>
            <p>📞 +852 2730 5577</p>
          </div>
          
          <div className="location">
            <h3>Tsing Yi</h3>
            <p>📍Shop 226, 2/F Maritime Square 2, 31-33 Tsing King Road</p>
            <p>📞 +852 2686 1733</p>
          </div>
        </div>
        
        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>  
      </div>
    </div>
  );
}

export default Contacts;