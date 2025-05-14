import UserCard from '../components/UserCard';
import {UserContext} from '../user/UserContext'
import {useContext} from 'react';

const Play = () => {
    const {user} = useContext(UserContext);
    console.log(user?.friendInfo?.friends);
    if (!user?.friendInfo?.friends) return null;
    return (
        <div className="bg-zinc-900 w-full grid grid-cols-1 lg:grid-cols-2 gap-5 p-8 text-white font-semibold font-sans">
            <div className="bg-zinc-800 p-5 rounded-2xl">
                <h1 className="text-2xl">Challenge a friend</h1>
                {/* TODO: get currently online friends and their status */}
                {user?.friendInfo?.friends.map((friendId) => {
                    <UserCard variant="MatchReq" userId={friendId} key={friendId}/>
                })}
            </div>
        </div>
    )
}

export default Play;