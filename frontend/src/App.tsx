import { useEffect, useState } from 'react'
import { defaultLanguages } from 'shared';
import './App.css'

function App() {
 const [languages, setLanguages] = useState(defaultLanguages);

  useEffect(() => {
    setTimeout(async () => {
      const res = await fetch('http://localhost:3000/languages');
      const languages = await res.json();
      setLanguages(languages);
    }, 3000);
  }, []);

  return (
    <>
      
      <h1>Vite + React</h1>
      <div className="card">
          {languages}
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
