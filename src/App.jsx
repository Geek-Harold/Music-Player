import "./App.css";
import Sidebar from "./components/Sidebar";

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <h2>Now Playing will go here</h2>
      </main>
    </div>
  );
}
