import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { useContext, useState } from "react";
import Modal from "../components/Match/Modal";
import Button from "../components/Button";
import SendChallengeModal from "../components/SendChallengeModal";
import MatchInviteCard from "../components/MatchInviteCard";
import LoggedInMessage from "../components/LoggedInMessage";

const Play = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [challengedUser, setChallengedUser] = useState(0);

  if (!user || !user?.friendInfo?.friends)
    return <LoggedInMessage/>;
  
  return (
    <>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <SendChallengeModal
          setShowModal={setShowModal}
          recipientId={challengedUser}
        />
      </Modal>
      <div className="bg-zinc-900 w-full grid grid-cols-1 lg:grid-cols-2 gap-5 p-8 text-white font-semibold font-sans">
        <div className="bg-zinc-800 p-5 rounded-2xl row-span-2">
          <h1 className="text-2xl mb-2">Challenge a friend</h1>
          {/* TODO: get currently online friends and their status */}
          {user?.friendInfo?.friends?.length === 0 && (
            <p className="text-zinc-400">You have no friends yet.</p>
          )}
          {user?.friendInfo?.friends?.map((friendId) => {
            return (
              <UserCard
                variant="MatchInvite"
                userId={friendId}
                key={friendId}
                setShowChallengeModal={setShowModal}
                setChallengedUser={setChallengedUser}
              />
            );
          })}
        </div>
        <div className="bg-zinc-800 p-5 rounded-2xl">
          <h1 className="text-2xl mb-2">Outgoing Challenges</h1>
          {user?.matchInviteInfo?.outgoingReqs?.length === 0 && (
            <p className="text-zinc-400">No outgoing challenges.</p>
          )}
          <div className="space-x-2 flex overflow-x-auto">
            {user?.matchInviteInfo?.outgoingReqs?.map((invite, i) => {
              return (
                <MatchInviteCard
                  variant="outgoing"
                  inviteData={invite}
                  key={i}
                />
              );
            })}
          </div>
        </div>
        <div className="bg-zinc-800 p-5 rounded-2xl">
          <h1 className="text-2xl mb-2">Incoming Challenges</h1>
          {user?.matchInviteInfo?.incomingReqs?.length === 0 && (
            <p className="text-zinc-400">No incoming challenges.</p>
          )}
          <div className="space-x-2 flex overflow-x-auto">
            {user?.matchInviteInfo?.incomingReqs?.map((invite, i) => {
              return (
                <MatchInviteCard
                  variant="incoming"
                  inviteData={invite}
                  key={i}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Play;
