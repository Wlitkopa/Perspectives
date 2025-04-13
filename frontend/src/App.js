import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useLocation, useParams } from 'react-router-dom';  // Dodajemy useLocation
import './App.css';
import axios from "axios";
// Przykładowa lista wpisów w formacie JSON
const promptsData = [
  {
    id: 1,
    text: 'Opis pierwszego prompta. Lorem ipsum dolor sit amet.',
    engText: 'Description of the first prompt. Lorem ipsum dolor sit amet.',
    image: 'https://example.com/image1.jpg',
    culture: 'Nordycka',
  },
  {
    id: 2,
    text: 'Opis drugiego prompta. Nulla facilisi.',
    engText: 'Description of the second prompt. Nulla facilisi.',
    image: 'https://example.com/image2.jpg',
    culture: 'Słowiańska',
  },
  {
    id: 3,
    text: 'Opis trzeciego prompta. Vivamus elementum erat.',
    engText: 'Description of the third prompt. Vivamus elementum erat.',
    image: 'https://example.com/image3.jpg',
    culture: 'Egipska',
  },
  {
    id: 4,
    text: 'Opis czwartego prompta. Sed ullamcorper ligula.',
    engText: 'Description of the fourth prompt. Sed ullamcorper ligula.',
    image: 'https://example.com/image4.jpg',
    culture: 'Celtycka',
  },
];


// Komponent reprezentujący nagłówek (widoczny na wszystkich stronach)
function Header() {
  const location = useLocation(); // Hook do sprawdzania bieżącej lokalizacji

  return (
    <div className="header">
      <h1>9 Światów</h1>
      {/* Pokazuj przycisk "Dodaj" tylko na stronie głównej */}
      {location.pathname === '/' && (
        <Link to="/prompt/new" className="add-prompt-button">
          Dodaj
        </Link>
      )}
    </div>
  );
}

// Komponent reprezentujący stronę główną (lista promptów)
function HomePage() {
  const [prompts, setprompts] = useState([]);

  useEffect(() => {
    // Możesz zamienić ten kod na fetch, aby pobrać dane z zewnętrznego źródła
    setprompts(promptsData);
  }, []);

  return (
    <div className="App">
      <Header />
      <div className="prompts-container">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="prompt-box">
            <Link to={`/prompt/${prompt.id}`} className="prompt-title">
              <h2>{prompt.id}. {prompt.text.slice(0, 20)}{prompt.text.length > 20 ? '...' : ''}</h2>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
  
}

// Komponent reprezentujący stronę pojedynczego prompta
function PromptPage() {
  const { id } = useParams();  // Zamiast match.params, używamy useParams
  const prompt = promptsData.find((p) => p.id === parseInt(id));

  if (!prompt) {
    return (
      <div className="prompt-page">
      <Header />
      <div className="prompt-details">
        <h2>prompt not found</h2>
      </div>
    </div>
    );
  }

  return (
    <div className="prompt-page">
      <Header />
      <div className="prompt-details">
        <p>{prompt.text}</p>
        <p style={{ fontStyle: 'italic', color: '#666' }}>{prompt.engText}</p>
        {prompt.image && (
          <img
            src={prompt.image}
            alt="Ilustracja do prompta"
            style={{ maxWidth: '100%', marginTop: '20px' }}
          />
        )}
      </div>
    </div>
  );
  
}


function PromptNew() {
  const [options, setOptions] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

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

    try {
      const res = await axios.post('/api/submit', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('Sukces:', res.data);
    } catch (err) {
      console.error('Błąd przy wysyłaniu:', err);
    }
  };

  return (
    <div className="App">
      <Header />
      <div className="prompts-container">
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
