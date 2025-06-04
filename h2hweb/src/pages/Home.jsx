import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  const numUsers = props.onlineUsers.length;

  return (
    <div className="bg-zinc-900 h-screen w-full p-12 inline font-sans space-y-8">
      <div className="text-7xl">
        <h2 className="text-white font-bold">Solve Head-to-Head</h2>
        <h2 className="text-emerald-600 font-bold">on the #1 site!</h2>
      </div>
      <div
        onClick={() => (useNavigate("/play"))}
        className="cursor-pointer bg-emerald-700 flex p-5 w-80 items-center rounded-lg hover:bg-emerald-800 transition-all"
      >
        <Users className="inline-block mr-4" />
        <div className="inline-block text-white text-lg">
          <p className="font-bold">Play Online</p>
          <p className="text-zinc-200">Compete with other cubers</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
