import React from 'react';
import { Link } from 'react-router-dom';
import '../Css/AboutUs.css';

function AboutUs() {
  return (
    <div className="about-page">
      <div className="about-container">
        <h1>About Hungry Korean</h1>
        <p className="tagline">Fresh • Fast • Authentic</p>
        
        <section className="about-section creative">
          <div className="section-icon">🎨</div>
          <h2>Creative</h2>
          <p>
            Welcome to Hungry Korean, where our menu puts a new twist on classic Korean food, 
            bringing a fresh modern version of some traditional favourites to liven up the 
            Hong Kong food scene.
          </p>
        </section>

        <section className="about-section healthy">
          <div className="section-icon">🌱</div>
          <h2>Healthy</h2>
          <p>
            Our food comes quickly - but that's all we have in common with "fast food". 
            The only thing in our food is food, hygienically prepared and freshly cooked 
            to order, with no MSG or other artificial additives.
          </p>
        </section>

        <section className="about-section delicious">
          <div className="section-icon">😋</div>
          <h2>Delicious</h2>
          <p>
            Inventive recipes, fresh ingredients, freshly cooked – it's good for you, 
            but most importantly, it tastes wonderful. But then your taste buds will 
            have told you that already by the time you read this!
          </p>
        </section>

        <div className="back-link">
          <Link to="/">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;