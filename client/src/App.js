import logo from "./logo.svg";
import "./App.css";
import Editor from "./Editor";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { v4 as uuidV4 } from "uuid";

function App() {
  return (
    // <div className="App">

    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={`/documents/${uuidV4()}`} />} />

        <Route path="/documents/:id" element={<Editor />} />
      </Routes>
    </Router>
    // </div>
  );
}

export default App;
