import UserCard from "../components/UserCard";
import { UserContext } from "../user/UserContext";
import { useContext, useState } from "react";
import Modal from "../components/Match/Modal";
import Button from "../components/Button";
import SendChallengeModal from "../components/SendChallengeModal";
import MatchInviteCard from "../components/MatchInviteCard";

const Play = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [challengedUser, setChallengedUser] = useState(0);

  if (!user?.friendInfo?.friends)
    return <div className="w-full h-screen bg-zinc-900"></div>;
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
