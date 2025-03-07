import { useDispatch, useSelector } from "react-redux"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";
import { setAuthUser } from "@/redux/authSlice";

const SuggestedUsers = () => {
    const {suggestedUsers, user} = useSelector((store)=> store.auth);
    const dispatch = useDispatch();
    let isFollowing;

    const followUnfollowUser = async (userId) => {
      try {
        const res = await axiosInstance.post(
          `/user/followorunfollow/${userId}`
        );
        if (res.data.success) {
          isFollowing = user?.following.includes(userId);
          let updatedUser;
          if(isFollowing){
            updatedUser = {
              ...user,
              following: user.following.filter((id)=> id !== userId)
            };
          }
          else{
            updatedUser = {
              ...user,
              following: [...user.following, userId]
            };
          }
          dispatch(setAuthUser(updatedUser));
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log("error follow or unfollow user", error);
      }
    }

  return (
    <div className="my-6">
      <div className="flex items-center justify-between text-sm gap-5">
        <h1 className="font-semibold text-gray-600">Suggested for you</h1>
        <span className="font-medium cursor-pointer">See All</span>
      </div>
      {suggestedUsers?.map((suggestedUser) => {
        const isFollowingUser = user?.following.includes(suggestedUser?._id);
        return (
          <div
            key={suggestedUser?._id}
            className="flex items-center justify-between my-6"
          >
            <div className="flex items-center gap-2">
              <Link to={`profile/${suggestedUser?._id}`}>
                <Avatar>
                  <AvatarImage
                    src={suggestedUser?.profilePicture?.url}
                    alt="Suggested User Image"
                  />
                  <AvatarFallback />
                </Avatar>
              </Link>
              <div>
                <h1 className="text-sm font-semibold">
                  <Link to={`/profile/${suggestedUser?._id}`}>
                    {suggestedUser?.username}
                  </Link>
                </h1>
                <span className="text-sm text-gray-600">
                  {suggestedUser?.bio || "Bio here..."}
                </span>
              </div>
            </div>
            {isFollowingUser ? (
              <span
                onClick={() => followUnfollowUser(suggestedUser?._id)}
                className="text-gray-600 hover:text-black text-sm font-bold cursor-pointer"
              >
                Following
              </span>
            ) : (
              <span
                onClick={() => followUnfollowUser(suggestedUser?._id)}
                className="text-[#3BADF8] hover:text-[#3495d6] text-sm font-bold cursor-pointer"
              >
                Follow
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SuggestedUsers