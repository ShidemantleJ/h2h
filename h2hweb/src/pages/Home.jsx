import { Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = (props) => {
  const navigate = useNavigate();
  return (
    <div className="h-screen w-full p-12 overflow-hidden font-sans space-y-8">
      <div className="text-4xl">
        <h2 className="text-white font-bold">H2HWeb</h2>
        <h2 className="text-emerald-600 font-bold">Compete Head-to-Head with Other Cubers</h2>
      </div>
      <div
        onClick={() => (navigate('/play'))}
        className="cursor-pointer bg-emerald-700 flex p-5 w-70 items-center rounded-lg hover:bg-emerald-800 transition-all"
      >
        <Users className="inline-block mr-4" />
        <div className="inline-block text-white">
          <p className="font-bold text-md">Play Online</p>
          <p className="text-zinc-200 text-sm">Compete with other cubers</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
