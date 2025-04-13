import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useParams } from 'react-router-dom';  // Dodajemy useLocation
import './App.css';
import axios from "axios";
import './PromptPage.css';


// Komponent reprezentujący nagłówek (widoczny na wszystkich stronach)
function Header() {
  const location = useLocation(); // Hook do sprawdzania bieżącej lokalizacji

  return (
    <div className="header">
      <h1><a href="/">Perspectives</a></h1>
      {/* Pokazuj przycisk "Dodaj" tylko na stronie głównej */}
      {location.pathname === '/' && (
        <Link to="/prompt/new" className="add-prompt-button">
          Create
        </Link>
      )}
    </div>
  );
}

// Komponent reprezentujący stronę główną (lista promptów)
function HomePage() {
  const [prompts, setPrompts] = useState([]);

  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/prompts');
        setPrompts(response.data); // Assuming the backend returns an array of prompts
      } catch (error) {
        console.error('Error fetching prompts:', error);
      }
    };

    fetchPrompts();
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="prompts-container">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="prompt-box">
            <Link to={`/prompt/${prompt.id}`} className="prompt-title">
              <h2>{prompt.id}. {prompt.text.slice(0, 60)}{prompt.text.length > 60 ? '...' : ''}</h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
  
}

function PromptPage() {
  const { id } = useParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/prompts/${id}/posts`);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    };
    fetchPosts();
  }, [id]);

  const handleNext = () => {
    if (currentIndex < posts.length - 3) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(posts.length - 3); // Loop to end
    }
  };

  return (
    <>
    <Header />
    <div className="prompt-page">
      <div className="posts-slider">
        {loading && <p>Loading posts...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {!loading && !error && (
          <>
            <div className="slider-container">
              <div
                className="slider"
                style={{
                  transform: `translateX(-${currentIndex * 33.33}%)`,
                }}
              >
                {posts.map((post, index) => (
                  <div key={index} className="post-tile-wrapper">
                    <div className="post-tile">
                      <h3>{post.culture}</h3>
                      <p>{post.text}</p>
                      {post.image && (
                        <img src={post.image} alt="Post" className="post-image" />
                      )}
                      <div className="tile-translation">
                        { post.eng_text !== post.text ?
                        <p>{post.eng_text}</p> : <></>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="slider-controls">
              <button className="prev" onClick={handlePrev}>
                &#8592;
              </button>
              <button className="next" onClick={handleNext}>
                &#8594;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}

function PromptNew() {
  const [options, setOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading

  useEffect(() => {
    fetch('/areas.txt')
      .then(res => res.text())
      .then(text => {
        const lines = text
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0);
        setOptions(lines);
      });
  }, []);

  const handleAddLocation = (e) => {
    const selected = e.target.value;
    if (selected && !selectedLocations.includes(selected)) {
      setSelectedLocations([...selectedLocations, selected]);
    }
    e.target.value = "";
  };

  const removeLocation = (loc) => {
    setSelectedLocations(selectedLocations.filter(l => l !== loc));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('text', text);
    formData.append('locations', JSON.stringify(selectedLocations));
    if (image) formData.append('image', image);

    setLoading(true); // Start loading

    try {
      const res = await axios.post('http://localhost:5000/api/prompts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Sukces:', res.data);
      setLoading(false); // Stop loading
      window.location.href = '/'; // Redirect to "/"
    } catch (err) {
      console.error('Błąd przy wysyłaniu:', err);
      setLoading(false); // Stop loading even if there's an error
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="prompts-container">
        {loading && (
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="form-box">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your post..."
            className="form-textarea"
            rows={6}
          />

          <select onChange={handleAddLocation} className="form-select">
            <option value="">-- choose regions --</option>
            {options.map((city, i) => (
              <option key={i} value={city}>{city}</option>
            ))}
          </select>

          <div className="tag-cloud">
            {selectedLocations.map((loc, index) => (
              <span key={index} className="tag">
                {loc}
                <button type="button" onClick={() => removeLocation(loc)} className="remove-tag">×</button>
              </span>
            ))}
          </div>

          <input type="file" accept="image/*" onChange={handleImageChange} className="form-file" />

          {previewUrl && (
            <div className="form-preview-wrapper">
              <img src={previewUrl} alt="preview" className="form-preview" />
            </div>)}


          <button type="submit" className="form-submit">Modify</button>
        </form>
      </div>
    </div>
  );
}


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/prompt/:id" element={<PromptPage />} />
        <Route path="/prompt/new" element={<PromptNew />} />
      </Routes>
    </Router>
  );
}

export default App;
