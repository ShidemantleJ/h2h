import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";

const Home = (props) => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full p-12 overflow-hidden font-sans space-y-8">
      <div className="text-center">
        <h2 className="text-white font-bold text-6xl">H2HCube</h2>
        <h2 className="text-emerald-600 mt-2 text-3xl">
          Compete Head-to-Head with Other Cubers
        </h2>
      </div>
      <div
        onClick={() => navigate("/play")}
        className="mx-auto cursor-pointer bg-emerald-700 flex p-5 w-70 items-center rounded-lg hover:bg-emerald-800 transition-all"
      >
        <Users className="inline-block mr-4" />
        <div className="inline-block text-white">
          <p className="font-bold text-md">Play Online</p>
          <p className="text-zinc-200 text-sm">Challenge a friend</p>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 m-5">
        <a
          href="https://github.com/ShidemantleJ/h2h"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-zinc-300 hover:text-emerald-400 underline text-md transition-colors"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default Home;
