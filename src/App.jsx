import "./App.css";
import Sidebar from "./components/Sidebar";
import NowPlaying from "./components/NowPlaying";
import RecentlyPlayed from "./components/RecentlyPlayed";
import Trending from "./components/Trending";
import VinylDisc from "./components/VinylDisc";

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="content">
        <NowPlaying />
        <RecentlyPlayed />
        <Trending />
      </main>
      <VinylDisc />
    </div>
  );
}
