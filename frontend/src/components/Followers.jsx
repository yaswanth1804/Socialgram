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

const Followers = ({ userProfile }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();

  const { user } = useSelector((store) => store.auth);

  const followUser = async (follower) => {
      try {
        const res = await axiosInstance.post(
          `/user/followorunfollow/${follower._id}`
        );
        if (res.data.success) {
            const updatedUser = {
              ...user,
              following: [...user.following, follower._id],
            };
            const updatedUserProfile = {
              ...userProfile,
              following: [...userProfile.following, follower],
            };
          dispatch(setAuthUser(updatedUser));
          dispatch(setUserProfile(updatedUserProfile));
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log("error follow or unfollow user", error);
      }
    }

  const filterFollowers = userProfile?.followers.filter((follower) =>
    follower.username && follower.username.toLowerCase().includes(searchTerm.toLowerCase())
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
        {filterFollowers.length > 0 ? (
          filterFollowers.map((follower) => {
            const isFollowingUser = userProfile?.following?.some(
              (followingUser) => followingUser._id === follower?._id
            );
            return (
              <div
                key={follower?._id}
                className="flex items-center justify-between mt-5"
              >
                <div className="flex items-center gap-2">
                  <Link to={`profile/${follower?._id}`}>
                    <Avatar>
                      <AvatarImage
                        src={follower?.profilePicture?.url}
                        alt="Follower Image"
                      />
                      <AvatarFallback />
                    </Avatar>
                  </Link>
                  <div>
                    <p className="font-semibold">
                      {follower?.username}
                      {!isFollowingUser && (
                        <span
                          className="text-[#3BADF8] hover:text-[#3495d6] text-sm font-bold cursor-pointer"
                          onClick={() => followUser(follower)}
                        >
                          <span className="text-black"> .</span> Follow
                        </span>
                      )}
                    </p>
                    <span className="text-gray-500 text-sm">
                      {follower?.bio}
                    </span>
                  </div>
                </div>
                <Button variant="secondary" className="hover:bg-gray-200 h-8">
                  Remove
                </Button>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 mt-3">
            No Follower found matching &quot;{searchTerm}&quot;.
          </p>
        )}
      </div>
    </div>
  );
};

export default Followers