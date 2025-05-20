import {
  Play,
  User,
  Users,
  Home,
  CircleArrowLeft,
  LogOut,
  LogIn,
} from "lucide-react";
import { useContext, useState } from "react";
import { UserContext } from "../user/UserContext";
import SidebarItemList from "./SidebarLinkList";
import SidebarLink from "./SidebarLink";

const topSidebarElements = [
  [<Home />, "Home", "/"],
  [<Play />, "Play", "/play"],
  [<Users />, "Friends", "/friends"],
];

const Sidebar = (props) => {
  const { user } = useContext(UserContext);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Arrow to collapse sidebar */}
      {/* Sidebar Parent Div */}
      <div
        className={`sticky bg-zinc-900 transition-[width] duration-400 shrink-0 border-zinc-700 border-r-1 top-0 h-dvh ${
          collapsed ? "w-20 p-5" : "w-58 p-5"
        }`}
      >
        <CircleArrowLeft
          className={`${
            collapsed && "rotate-180"
          } block transition-all duration-400 absolute z-10 -right-3 text-zinc-300 bg-zinc-900 cursor-pointer`}
          onClick={() => setCollapsed((prev) => !prev)}
        />
        {/* Sidebar Items */}
        <div className={`overflow-hidden flex flex-col justify-between h-full`}>
          {/* Sidebar Top Items List */}
          <ul className="block">
            <SidebarItemList
              variant="normal"
              dropdownCollapsed={collapsed}
              items={topSidebarElements}
            />
          </ul>

          {/* Sidebar Bottom Items List */}
          <ul className="block">
            {user ? (
              <>
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<User />}
                  name="My Profile"
                  link={`/users/${user.dbInfo.id}`}
                  variant="normal"
                />
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<LogOut />}
                  name="Log Out"
                  link={`/users/${user.dbInfo.id}`}
                  variant="button"
                />
              </>
            ) : (
              <>
                <SidebarLink
                  dropdownCollapsed={collapsed}
                  icon={<LogIn />}
                  name="Log in with WCA ID"
                  link={`${import.meta.env.VITE_BACKEND_URL}/auth/wca`}
                  variant="button"
                />
              </>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};
export default Sidebar;
