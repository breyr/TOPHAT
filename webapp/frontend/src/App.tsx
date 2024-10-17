import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, [])

  const fetchData = async () => {
    const response = await fetch('/api/');
    const data = await response.json();
    setMessage(data.message);
  }

  return <h1 className="text-3xl font-bold">{message}</h1>
}

export default App
