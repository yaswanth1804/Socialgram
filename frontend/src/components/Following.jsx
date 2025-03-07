/* eslint-disable react/prop-types */
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useState } from "react";
import { axiosInstance } from "@/lib/utils";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const Following = ({ userProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
const dispatch = useDispatch();

const { user } = useSelector((store) => store.auth);

const followOrUnfollowUser = async (following) => {
   const isFollowing = userProfile?.following?.some(
     (followingUser) => followingUser._id === following._id
   );
  try {
    const res = await axiosInstance.post(
      `/user/followorunfollow/${following._id}`
    );
    if (res.data.success) {
      let updatedUser;
      let updatedUserProfile;

      if (isFollowing){
        updatedUser = {
          ...user,
          following: user.following.filter((id) => id !== following._id),
        };

        updatedUserProfile = {
          ...userProfile,
          following: userProfile.following.filter(
            (flwuser) => flwuser._id !== following?._id
          ),
        };
      }
      else {
        updatedUser = {
          ...user,
          following: [...user.following, following._id],
        };
        updatedUserProfile = {
          ...userProfile,
          following: [...userProfile.following, following],
        };
      }
      dispatch(setAuthUser(updatedUser));
      dispatch(setUserProfile(updatedUserProfile));
      toast.success(res.data.message);
    }
  } catch (error) {
    console.log("error follow or unfollow user", error);
  }
};

  const filterFollowingUsers = userProfile?.following.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="border-t border-gray-300 w-full"></div>
      <div>
        <div className="relative mt-3">
          <Search className="absolute left-2 top-1" />
          <Input
            type="text"
            placeholder="Search"
            className="pl-10 font-normal focus-visible:ring-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {filterFollowingUsers.length > 0 ? (
          filterFollowingUsers.map((followingUser) => {
            const isFollowingUser = userProfile?.following?.some(
              (flwUser) => flwUser._id === followingUser?._id
            );
            return (
              <div
                key={followingUser?._id}
                className="flex items-center justify-between mt-5"
              >
                <div className="flex items-center gap-2">
                  <Link to={`profile/${followingUser?._id}`}>
                    <Avatar>
                      <AvatarImage
                        src={followingUser?.profilePicture?.url}
                        alt="Following User Image"
                      />
                      <AvatarFallback />
                    </Avatar>
                  </Link>
                  <div>
                    <p className="font-semibold">{followingUser?.username}</p>
                    <span className="text-gray-500 text-sm">
                      {followingUser?.bio}
                    </span>
                  </div>
                </div>
                {isFollowingUser ? (
                  <Button
                    variant="secondary"
                    className="hover:bg-gray-200 h-8"
                    onClick={() => followOrUnfollowUser(followingUser)}
                  >
                    Following
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="bg-[#3BADF8] hover:bg-[#3495d6] h-8"
                    onClick={() => followOrUnfollowUser(followingUser)}
                  >
                    Follow
                  </Button>
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            No Following User found matching &quot;{searchTerm}&quot;.
          </p>
        )}
      </div>
    </div>
  );
};

export default Following;
