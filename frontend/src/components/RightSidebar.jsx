import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {Link} from "react-router-dom";
import SuggestedUsers from "./SuggestedUsers";
const RightSidebar = () => {
  const {user} = useSelector((store)=>store.auth);
  return (
    <div className="hidden lg:block max-w-sm md:max-w-72 w-full my-10 mr-[2%]">

      <div className="flex items-center gap-2">
        <Link to={`/profile/${user?._id}`}>
          <Avatar>
            <AvatarImage src={user?.profilePicture?.url} alt="User Image" />
            <AvatarFallback />
          </Avatar>
        </Link>
        <div>
          
          <h1 className="text-sm font-semibold">
            <Link to={`/${user?._id}/profile`}>{user?.username}</Link>
          </h1>
          <span className="text-sm text-gray-600">
            {user?.bio || "Bio here..."}
          </span>
        </div>
      </div>
      <hr className="my-3" />
      <SuggestedUsers />
    </div>
  );
}

export default RightSidebar

