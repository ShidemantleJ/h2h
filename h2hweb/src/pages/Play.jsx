import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { useContext, useState } from "react";
import Modal from "../components/Match/Modal";
import Button from "../components/Button";
import SendChallengeModal from "../components/SendChallengeModal";
import MatchCard from "../components/MatchCard";
import LoggedInMessage from "../components/LoggedInMessage";
import { Users, Send, ArrowRight, Info } from "lucide-react";
import UserCardList from "../components/UserCardList";

const Play = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [challengedUser, setChallengedUser] = useState(0);

  if (!user || !user?.friendInfo?.friends) return <LoggedInMessage />;

  return (
    <>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <SendChallengeModal
          setShowModal={setShowModal}
          recipientId={challengedUser}
        />
      </Modal>
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-4 gap-8 p-8 text-white font-sans">
        {/* Challenge a Friend */}
        <div className="bg-zinc-800 p-6 rounded-2xl row-span-1 max-h-[70vh] lg:col-span-2 overflow-y-auto shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-emerald-400" />
            <h1 className="text-2xl font-semibold">Challenge a Friend</h1>
          </div>
          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto">
            {user?.friendInfo?.friends?.length === 0 && (
              <p className="text-zinc-400">You have no friends yet.</p>
            )}
            <UserCardList
              variant="MatchInvite"
              usersArray={user?.friendInfo?.friends}
              setShowChallengeModal={setShowModal}
              setChallengedUser={setChallengedUser}
              keyPrefix="friend_to_challenge_"
            />
          </div>
        </div>
        {/* Outgoing Challenges */}
        <div className="bg-zinc-800 p-6 rounded-2xl max-h-[60vh] row-span-1 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Send className="text-amber-400" />
            <h1 className="text-2xl font-semibold">Outgoing Challenges</h1>
          </div>
          {user?.matchInviteInfo?.outgoingReqs?.length === 0 && (
            <p className="text-zinc-400">No outgoing challenges.</p>
          )}
          <div className="space-x-2 flex flex-col gap-2 overflow-y-auto py-2">
            {user?.matchInviteInfo?.outgoingReqs?.map((invite, i) => (
              <MatchCard variant="outgoingReq" inviteData={invite} key={i} />
            ))}
          </div>
        </div>

        {/* Incoming Challenges */}
        <div className="bg-zinc-800 p-6 rounded-2xl row-span-1 shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Send className="text-emerald-400" />
            <h1 className="text-2xl font-semibold">Incoming Challenges</h1>
          </div>
          {user?.matchInviteInfo?.incomingReqs?.length === 0 && (
            <p className="text-zinc-400">No incoming challenges.</p>
          )}
          <div className="space-x-2 flex flex-col gap-2 overflow-y-auto py-2">
            {user?.matchInviteInfo?.incomingReqs?.map((invite, i) => (
              <MatchCard variant="incomingReq" inviteData={invite} key={i} />
            ))}
          </div>
        </div>

        {/* How it Works / Tips Section */}
        <div className="bg-zinc-800 p-6 rounded-2xl shadow-lg flex flex-col col-span-1 lg:col-span-4 mt-8">
          <div className="flex items-center gap-2 mb-2">
            <Info className="text-blue-400" />
            <h2 className="text-xl font-semibold">How it Works</h2>
          </div>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>Challenge a friend to start a match.</li>
            <li>
              Once a challenge is accepted, you'll be taken to the match room.
              Your opponent must join within 1 minute of you accepting.
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Play;
