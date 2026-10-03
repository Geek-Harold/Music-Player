import "./App.css";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <NowPlaying />
      </main>
    </div>
  );
}
