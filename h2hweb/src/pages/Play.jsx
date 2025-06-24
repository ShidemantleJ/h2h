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
import { OnlineUsersContext } from "../user/OnlineUsersContext";
import EventSelector from "../components/EventSelector";

const Play = () => {
  const { user } = useContext(UserContext);
  const [showModal, setShowModal] = useState(false);
  const [challengedUser, setChallengedUser] = useState(-1);
  const [selectedEvent, setSelectedEvent] = useState("All");

  if (!user || !user?.friendInfo?.friends) return <LoggedInMessage />;

  // Filter randomIncomingReqs by selected event
  const filteredRandomIncomingReqs =
    selectedEvent === "All"
      ? user?.matchInviteInfo?.randomIncomingReqs
      : user?.matchInviteInfo?.randomIncomingReqs?.filter(
          (invite) => invite.event === selectedEvent
        );

  return (
    <>
      <Modal open={showModal} onClose={() => setShowModal(false)}>
        <SendChallengeModal
          setShowModal={setShowModal}
          recipientId={challengedUser}
        />
      </Modal>
      <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-4 grid-rows-3 gap-8 p-8 text-white font-sans">
        {/* Challenge a Friend */}
        <div className="bg-zinc-800 p-6 rounded-2xl h-[60vh] lg:col-span-2 overflow-y-auto shadow-lg flex flex-col">
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
        <div className="bg-zinc-800 p-6 rounded-2xl h-[60vh] shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Send className="text-amber-400" />
            <h1 className="text-2xl font-semibold">Outgoing Challenges</h1>
          </div>
          {user?.matchInviteInfo?.outgoingReqs?.length === 0 && (
            <p className="text-zinc-400">No outgoing challenges.</p>
          )}
          <div className="space-x-2 flex flex-col gap-2 overflow-y-auto py-2">
            {user?.matchInviteInfo?.outgoingReqs?.map((invite, i) => (
              <MatchCard
                variant="outgoingReq"
                inviteData={invite}
                key={invite.id}
              />
            ))}
          </div>
        </div>

        {/* Incoming Challenges */}
        <div className="bg-zinc-800 p-6 rounded-2xl h-[60vh] shadow-lg flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Send className="text-emerald-400" />
            <h1 className="text-2xl font-semibold">Incoming Challenges</h1>
          </div>
          {user?.matchInviteInfo?.incomingReqs?.length === 0 && (
            <p className="text-zinc-400">No incoming challenges.</p>
          )}
          <div className="space-x-2 flex flex-col gap-2 overflow-y-auto py-2">
            {user?.matchInviteInfo?.incomingReqs?.map((invite, i) => (
              <MatchCard
                variant="incomingReq"
                inviteData={invite}
                key={invite.id}
              />
            ))}
          </div>
        </div>

        {/* View challenges from random users */}
        <div className="bg-zinc-800 p-6 rounded-2xl max-h-[60vh] lg:col-span-4 shadow-lg flex flex-col">
          <div className="flex flex-row items-center justify-between mb-1">
            <h1 className="text-xl font-semibold text-white">
              Challenges from random users
            </h1>
            <span>
              <Button
                onClick={() => {
                  setChallengedUser(-1);
                  setShowModal(true);
                }}
                text="Challenge a random opponent"
              />
            </span>
          </div>
          <div className="mb-2">
            <EventSelector
              value={selectedEvent}
              setSelectedEvent={setSelectedEvent}
              showAllOption={true}
              className="w-full max-w-xs"
            />
          </div>
          {filteredRandomIncomingReqs?.length === 0 && (
            <p className="text-zinc-400">No incoming challenges.</p>
          )}
          <div className="flex flex-row flex-wrap gap-2 py-2 h-full">
            {filteredRandomIncomingReqs?.map((invite) => (
              <span className="w-min" key={invite.id}>
                <MatchCard
                  variant="incomingReq"
                  showDecline={false}
                  inviteData={invite}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Play;
