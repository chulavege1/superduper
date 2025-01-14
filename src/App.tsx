import { useState, useEffect } from 'react'; // Убираем импорт React
import axios from 'axios';
import './App.css';

// Define the types for images and API responses
interface Image {
  name: string;
  url: string;
}

interface CaptchaResponse {
  task: string;
  images: Image[];
  sessionId: string;
}

function App() {
  const [images, setImages] = useState<Image[]>([]); // Specify type for images
  const [task, setTask] = useState('');
  const [selected, setSelected] = useState<string[]>([]); // Specify type for selected items
  const [sessionId, setSessionId] = useState('');
  const [timer, setTimer] = useState(30); // 30 seconds timer
  const [isCaptchaPassed, setIsCaptchaPassed] = useState(false);

  // Fetch captcha on load or refresh
  const fetchCaptcha = async () => {
    try {
      const response = await axios.get<CaptchaResponse>('https://back-pqg0.onrender.com/api/captcha');
      const { task: taskCategory, images: fetchedImages, sessionId: session } = response.data;
      setTask(taskCategory);
      setImages(fetchedImages);
      setSessionId(session);
      setSelected([]);
      setTimer(30);
      setIsCaptchaPassed(false);
    } catch (error) {
      console.error('Failed to fetch captcha:', error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (!isCaptchaPassed && timer > 0) {
      const interval = setInterval(() => setTimer(prev => prev - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer, isCaptchaPassed]);

  // Handle image selection
  const handleSelect = (imageName: string) => {
    if (selected.includes(imageName)) {
      setSelected(selected.filter(item => item !== imageName));
    } else {
      setSelected([...selected, imageName]);
    }
  };

  // Validate captcha
  const validateCaptcha = async () => {
    try {
      const response = await axios.post('https://back-pqg0.onrender.com/api/captcha/validate', {
        sessionId,
        selected,
        task,
      });

      if (response.data.success) {
        alert('Captcha passed successfully!');
        setIsCaptchaPassed(true);
        fetchCaptcha(); // Reload captcha after successful validation
      } else {
        alert('Captcha failed. Try again.');
        setSelected([]);
      }
    } catch (error) {
      console.error('Captcha validation failed:', error);
    }
  };

  return (
    <div className="App">
      <h1>Image Captcha</h1>
      <p>Task: Select all images related to "{task}"</p>
      <p>Time left: {timer} seconds</p>
      {isCaptchaPassed ? (
        <div>
          <p>Captcha passed! Click below to retry:</p>
          <button onClick={fetchCaptcha}>Try Another Captcha</button>
        </div>
      ) : (
        <div>
          <div className="image-grid">
            {images.map((image) => (
              <div
                key={image.name}
                className={`image-container ${selected.includes(image.name) ? 'selected' : ''}`}
                onClick={() => handleSelect(image.name)}
              >
                <img src={`https://back-pqg0.onrender.com${image.url}`} alt={image.name} />
              </div>
            ))}
          </div>
          <button onClick={validateCaptcha} disabled={selected.length < 3}>
            Validate
          </button>
        </div>
      )}
    </div>
  );
}

export default App;