import React from "react";
import SidebarLink from "./SidebarLink";
import { LogIn } from "lucide-react";

function LoggedInMessage(props) {
  return (
    <div className="w-full flex items-center justify-center bg-zinc-900 min-h-dvh text-white">
      <div className="">
          <p className="text-xl">You must be logged in to view this page</p>
          <div className="w-fit mx-auto">
              <SidebarLink
                icon={<LogIn />}
                name="Log in with WCA ID"
                link={`${import.meta.env.VITE_BACKEND_URL}/auth/wca`}
                variant="button"
              />
          </div>
      </div>
    </div>
  );
}

export default LoggedInMessage;
