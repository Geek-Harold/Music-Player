import "./App.css";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <NowPlaying />
        <RecentlyPlayed />
        <Trending />
      </main>
    </div>
  );
}
