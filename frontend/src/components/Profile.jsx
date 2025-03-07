import useGetUserProfile from "@/hooks/useGetUserProfile"
import { useDispatch, useSelector } from "react-redux";
import {useParams} from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { AtSign } from "lucide-react";
import { useState } from "react";
import { Heart } from "lucide-react";
import { MessageCircle } from "lucide-react";
import {Link} from "react-router-dom"
import { toast } from "sonner";
import { axiosInstance } from "@/lib/utils";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import Followers from "./Followers";
import Following from "./Following";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

const Profile = () => {
  const params = useParams();
  const userId = params.id
  useGetUserProfile(userId);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("posts");
  const [isOpenFollowers, setIsOpenFollowers] = useState(false);
  const [isOpenFollowings, setIsOpenFollowings] = useState(false);

  const {userProfile, user} = useSelector((store) => store.auth);
  const isLoggedInUserProfile = userProfile?._id === user?._id;
  const isFollowing = user?.following.includes(userId);

  const followUnfollowUser = async (userId) => {
      try {
        const res = await axiosInstance.post(
          `/user/followorunfollow/${userId}`
        );
        if (res.data.success) {
          let updatedUser;
          let updatedUserProfile;
          if(isFollowing){
            updatedUser = {
              ...user,
              following: user.following.filter((id)=> id !== userId)
            };

            updatedUserProfile = {
              ...userProfile,
              followers: userProfile.followers.filter((id) => id !== user?._id),
            };
          }
          else{
            updatedUser = {
              ...user,
              following: [...user.following, userId]
            };
            updatedUserProfile = {
              ...userProfile,
              followers: [...userProfile.followers, user?._id],
            };
          }
          dispatch(setAuthUser(updatedUser));
          dispatch(setUserProfile(updatedUserProfile));
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log("error follow or unfollow user", error);
      }
    }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  }

  const displayPost = activeTab === "posts" ? userProfile?.posts : userProfile?.bookmarks

  return (
    <div className="flex justify-center max-w-2xl xl:max-w-4xl lg:max-w-3xl md:max-w-2xl md:pl-[20%] lg:pl-[30%] mx-10 md:mx-2">
      <div className="flex flex-col gap-20 p-8">
        <div className="flex flex-col sm:flex-row flex-1 gap-10">
          <section className="w-1/4 flex items-center justify-start xl:justify-center">
            <Avatar className="h-24 w-24 sm:h-32 sm:w-32">
              <AvatarImage
                src={userProfile?.profilePicture?.url}
                alt="User Image"
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section className="w-3/4">
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button
                        variant="secondary"
                        className="hover:bg-gray-200 h-8"
                      >
                        Edit Profile
                      </Button>
                    </Link>
                    {/* <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      View Archieve
                    </Button>
                    <Button
                      variant="secondary"
                      className="hover:bg-gray-200 h-8"
                    >
                      Ad Tools
                    </Button> */}
                  </>
                ) : isFollowing ? (
                  <>
                    <Button
                      onClick={() => followUnfollowUser(userProfile?._id)}
                      variant="secondary"
                    >
                      Unfollow
                    </Button>
                    <Button variant="secondary">Message</Button>
                  </>
                ) : (
                  <Button
                    onClick={() => followUnfollowUser(userProfile?._id)}
                    variant="secondary"
                    className="bg-[#0095F6] hover:bg-[#3192d2] h-8 text-white"
                  >
                    Follow
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <p>
                  <span className="font-semibold">
                    {userProfile?.posts?.length}
                  </span>{" "}
                  posts
                </p>
                <p
                  className="cursor-pointer"
                  onClick={() => setIsOpenFollowers(true)}
                >
                  <span className="font-semibold">
                    {userProfile?.followers?.length}
                  </span>{" "}
                  followers
                </p>
                <p
                  className="cursor-pointer"
                  onClick={() => setIsOpenFollowings(true)}
                >
                  <span className="font-semibold cursor-pointer">
                    {userProfile?.following?.length}
                  </span>{" "}
                  following
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-semibold">
                  {userProfile?.bio || "bio here..."}
                </span>
                <Badge variant="secondary" className="w-fit mb-1 text-xl">
                  <AtSign />{" "}
                  <span className="pl-1">{userProfile?.username}</span>
                </Badge>
                {/* <span>🤯Learn code with ease</span> */}
                {/* <span>🤯Turing code into fun</span>
                <span>🤯DM for collaboration</span> */}
              </div>
            </div>
          </section>
        </div>
        {/* all posts here  */}
        <div className="border-t border-gray-200">
          <div className="flex items-center justify-center gap-10 text-sm">
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "posts" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("posts")}
            >
              POSTS
            </span>
            <span
              className={`py-3 cursor-pointer ${
                activeTab === "saved" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("saved")}
            >
              SAVED
            </span>
            {/* <span
              className={`py-3 cursor-pointer ${
                activeTab === "reels" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("reels")}
            >
              REELS
            </span> */}
            {/* <span
              className={`py-3 cursor-pointer ${
                activeTab === "tags" ? "font-bold" : ""
              }`}
              onClick={() => handleTabChange("tags")}
            >
              TAGS
            // </span> */} 
          </div>
          <div className="grid grid-cols-3 gap-1">
            {displayPost?.map((post) => {
              console.log(displayPost);
              return (
                <div key={post} className="relative group cursor-pointer">
                  <img
                    src={post?.image[0]?.url}
                    alt="Post Image"
                    className="rounded-sm my-2 w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="flex items-center text-white space-x-4">
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <Heart />
                        <span>{post?.likes?.length}</span>
                      </button>
                      <button className="flex items-center gap-2 hover:text-gray-300">
                        <MessageCircle />
                        <span>{post?.comments?.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Followers In Modal */}
      <Dialog open={isOpenFollowers} onOpenChange={setIsOpenFollowers}>
        <DialogContent>
          <DialogTitle className="text-center">Followers</DialogTitle>
          <Followers userProfile={userProfile} />
        </DialogContent>
      </Dialog>

      {/* Following Modal */}
      <Dialog open={isOpenFollowings} onOpenChange={setIsOpenFollowings}>
        <DialogContent>
          <DialogTitle className="text-center">Following</DialogTitle>
          <Following userProfile={userProfile} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Profile