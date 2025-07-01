import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import { useEffect, useState } from "react";
import MatchCard from "../components/MatchCard";
import { getLastXMatches } from "../utils/userStats";

const Home = (props) => {
  const navigate = useNavigate();
  const [recentMatches, setRecentMatches] = useState([]);
  useEffect(() => {
    async function fetchRecent() {
      const matches = await getLastXMatches("all", null, 0, 10);
      setRecentMatches(matches);
    }
    fetchRecent();
  }, []);

  return (
    <div className="relative min-h-screen w-full font-sans">
      <div className="w-full p-12 overflow-hidden font-sans space-y-8">
        <div className="text-center">
          <h2 className="text-white font-bold text-6xl">H2HCube</h2>
          <h2 className="text-emerald-500 mt-2 text-3xl">
            Compete Head-to-Head with Other Cubers
          </h2>
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
        <div className="flex flex-col md:flex-row gap-8 items-start justify-center mt-12">
          <div
            onClick={() => navigate("/play")}
            className="cursor-pointer mx-auto md:mx-0 bg-emerald-700 flex p-5 w-60 items-center rounded-lg hover:bg-emerald-800 transition-all mb-8 md:mb-0"
          >
            <Users className="inline-block mr-4" />
            <div className="inline-block text-white">
              <p className="font-bold text-md">Play Online</p>
              <p className="text-zinc-200 text-sm">Challenge a friend</p>
            </div>
          </div>
          {/* Recent Matches Section */}
          <div className="w-full lg:w-1/3 bg-zinc-800/80 rounded-2xl shadow-lg p-6 border border-zinc-700">
            <h1 className="font-semibold text-emerald-500 text-2xl text-center mb-2">
              Recent Matches
            </h1>
            <div className="flex-1 overflow-y-auto max-h-72 space-y-2">
              {recentMatches?.length === 0 ? (
                <div className="text-zinc-400 text-center mt-8">
                  No recent matches found.
                </div>
              ) : (
                recentMatches?.map((match) => (
                  <MatchCard
                    inviteData={match}
                    variant="normal"
                    key={match.id}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
