import {Play, User, Users, Home} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../user/UserContext';

const Sidebar = (props) => {
  const navigate = useNavigate();
  const {user} = useContext(UserContext);
  // console.log(user);
    return (
      <>
    {/* Sidebar Parent Div */}
    <div className="bg-zinc-900 shrink-0 border-zinc-700 border-r-1 top-0 sticky h-screen w-60 p-5 flex flex-col justify-between">
      {/* Sidebar Top Items List */}
      <ul className="block">
        <li onClick={() => navigate("/")} className="cursor-pointer rounded-md hover:bg-zinc-800 duration-200 py-2 pl-2">
          <Home className='font-sans text-zinc-300 inline-block'/>
          <a className="ml-2 font-sans text-zinc-300 inline-block">Home</a>
        </li>
        <li onClick={() => navigate("/play")} className="cursor-pointer rounded-md hover:bg-zinc-800 duration-200 py-2 pl-2">
          <Play className='font-sans text-zinc-300 inline-block'/>
          <a className="ml-2 font-sans text-zinc-300 inline-block">Play</a>
        </li>
        <li onClick={() => navigate("/friends")} className="cursor-pointer block rounded-md hover:bg-zinc-800 duration-200 py-2 pl-2">
          <Users className='font-sans text-zinc-300 inline-block'/>
          <a className="ml-2 font-sans text-zinc-300 inline-block">Friends</a>
        </li>
      </ul>

      {/* Sidebar Bottom Items List */}
      <ul className="block">
        {user && <li onClick={() => navigate(`/users/${user.dbInfo.id}`)} className="cursor-pointer block rounded-md hover:bg-zinc-800 duration-200 p-2">
          <User className='font-sans text-zinc-300 inline-block'/>
          <a className="ml-2 font-sans text-zinc-300 inline-block">{user.dbInfo.name}</a>
        </li>}
        {!user ? <li className="cursor-pointer mt-3 block rounded-[6px] bg-emerald-700 hover:bg-emerald-800 transition-all p-2 text-center text-white font-sans font-bold" onClick={() => window.location.href="http://localhost:5000/auth/wca"}>
          <p>Login with WCA ID</p>
        </li> :
        <li className="cursor-pointer mt-3 block rounded-[6px] bg-emerald-700 hover:bg-emerald-800 transition-all p-2 text-center text-white font-sans font-bold" onClick={() => window.location.href="http://localhost:5000/auth/logout"}>
        <p>Logout</p>
      </li>}
      </ul>
    </div>
</>
    );
  }
export default Sidebar;