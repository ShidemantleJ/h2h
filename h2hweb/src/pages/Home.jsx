import {Users} from 'lucide-react';

const Home = (props) => {
  const numUsers = props.onlineUsers.length;
    return (
        <div className="bg-zinc-900 h-screen w-full p-12 inline font-sans space-y-8">
        <div className="text-7xl">
          <h2 className="text-white font-bold">Solve Head-to-Head</h2>
          <h2 className="text-emerald-600 font-bold">on the #1 site!</h2>
        </div>
        <div className="cursor-pointer bg-emerald-700 flex p-5 w-80 items-center rounded-lg hover:bg-emerald-800 transition-all">
          <Users className='inline-block mr-4'/>
          <div className='inline-block text-white text-lg'>
            <p className='font-bold'>Play Online</p>
            <p className='text-zinc-200'>Compete with other cubers</p>
          </div>
        </div>
        {/* <div className="text-white font-semibold text-2xl">
          {numUsers === 1 ? numUsers + " User" : numUsers + " Users"} Online Now
          {numUsers === 0 && " :("} 
        </div> */}
      </div>
    )
}

export default Home;