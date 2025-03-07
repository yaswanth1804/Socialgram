/* eslint-disable react/prop-types */
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { axiosInstance } from "@/lib/utils";
import { setPosts, setSelectedPosts } from "@/redux/postSlice";
import {
  Bookmark,
  BookmarkCheck,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  // Send,
} from "lucide-react";
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import CommentDialog from "./CommentDialog";
import { Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { setAuthUser, setUserProfile } from "@/redux/authSlice";
import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import { formatDistanceToNowStrict } from "date-fns";
import { Dot } from "lucide-react";

const Post = ({ post }) => {
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { user, userProfile } = useSelector((store) => store.auth);
  const { posts } = useSelector((store) => store.post);
  const [liked, setLiked] = useState(post.likes.includes(user?._id) || false);
  const [postLikeCount, setPostLikeCount] = useState(post.likes.length);
  const [comment, setComment] = useState(post.comments);
  const dispatch = useDispatch();
  const isBookmarked = user?.bookmarks.includes(post?._id);

  const timeAgo = post.createdAt
    ? formatDistanceToNowStrict(new Date(post.createdAt), {
        addSuffix: false,
        roundingMethod: "floor",
      })
        .replace(" minutes", "m")
        .replace(" minute", "m")
        .replace(" hours", "h")
        .replace(" hour", "h")
        .replace(" days", "d")
        .replace(" day", "d")
        .replace(" months", "mo")
        .replace(" month", "mo")
        .replace(" years", "y")
        .replace(" year", "y")
    : "5d";

  const changeEventHandler = (e) => {
    e.preventDefault();
    const inputText = e.target.value;
    inputText.trim() ? setText(inputText) : setText("");
  };

  const totalCommentCount = comment.reduce(
    (acc, curr) => acc + 1 + (curr.replies?.length || 0),
    0
  );


  const updatePostHandler = async () => {
    if (!editCaption.trim()) return toast.error("Caption cannot be empty!");

    setUpdateLoading(true);
    try {
      const res = await axiosInstance.put(`/post/${post?._id}/update`, {
        caption: editCaption,
      });

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === post._id ? { ...p, caption: editCaption } : p
        );

        dispatch(setPosts(updatedPosts));
        toast.success("Post updated successfully!");
        setEditMode(false);
      }
    } catch (error) {
      console.error("Error updating post caption", error);
      toast.error(error.response.data.message);
    } finally {
      setUpdateLoading(false);
    }
  };

  const deletePostHandler = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.delete(`/post/${post?._id}/delete`);

      if (res.data.success) {
        const updatedPosts = posts.filter(
          (postItem) => postItem?._id !== post?._id
        );
        dispatch(setPosts(updatedPosts));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Error deleting post", error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const likeOrDislikePostHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.put(`/post/${post?._id}/${action}`);
      if (res.data.success) {
        const updatedLikes = liked ? postLikeCount - 1 : postLikeCount + 1;
        setPostLikeCount(updatedLikes);
        setLiked(!liked);
        // update post data
        const updatedPostData = posts.map((p) =>
          p._id === post._id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );
        dispatch(setPosts(updatedPostData));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log("Error perform action on this post", error);
      toast.error(error.response.data.message);
    }
  };

  const commentHandler = async () => {
    if (!text.trim()) {
      toast.error("Comment cannot be empty!");
      return;
    }
  
    try {
      const res = await axiosInstance.post(`/post/${post?._id}/comment`, {
        text,
      });
  
      if (res.data.success) {
        const updatedCommentData = [...comments, res.data.data]; // Ensure 'comments' is the correct state variable
  
        setComment(updatedCommentData);
  
        const updatedPostData = posts.map((p) =>
          p._id === post._id ? { ...p, comments: updatedCommentData } : p
        );
  
        dispatch(setPosts(updatedPostData));
        setText(""); // Clear the input after posting
        toast.success(res.data.message);
      } else {
        toast.error(res.data.message || "Failed to post comment");
      }
    } catch (error) {
      console.error("Error commenting on post:", error);
      toast.error(error.response?.data?.message || "Failed to post comment");
    }
  };
  

  const bookmarkHandler = async () => {
    try {
      const res = await axiosInstance.get(`/post/${post?._id}/bookmark`);
      if (res.data.success) {
        toast.success(res.data.message);

        const updatedPostIdToBookmark = user.bookmarks.includes(post._id)
          ? user.bookmarks.filter((id) => id !== post._id)
          : [...user.bookmarks, post._id];
        dispatch(setAuthUser({ ...user, bookmarks: updatedPostIdToBookmark }));

        if (user?._id === userProfile?._id) {
          const updatedPostToBookmark = userProfile.bookmarks.some(
            (bookmark) => bookmark._id === post._id
          )
            ? userProfile.bookmarks.filter(
                (bookmark) => bookmark._id !== post._id
              )
            : [...userProfile.bookmarks, post];

          dispatch(
            setUserProfile({ ...userProfile, bookmarks: updatedPostToBookmark })
          );
        }
      }
    } catch (error) {
      console.log("error on bookmark post", error);
    }
  };

  return (
    <div className="my-8 w-full max-w-sm mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link to={`profile/${post?.author?._id}`}>
            <Avatar>
              <AvatarImage
                src={post?.author?.profilePicture?.url}
                alt="User Image"
              />
              <AvatarFallback />
            </Avatar>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <Link to={`profile/${post?.author?._id}`}>
                <h1 className="font-bold">{post.author.username}</h1>
              </Link>
              <Dot />
              <span className="text-gray-500 text-sm">{timeAgo}</span>
            </div>
            {user?._id === post?.author?._id && (
              <Badge variant="secondary">Author</Badge>
            )}
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="flex flex-col items-center text-sm text-center">
            {user && user?._id !== post?.author?._id && (
              <Button
                variant="ghost"
                className="cursor-pointer w-fit text-[#ED4956] font-bold"
              >
                Unfollow
              </Button>
            )}
            {/* <Button variant="ghost" className="cursor-pointer w-fit">
              Add to Favourites
            </Button> */}
            {user && user?._id === post?.author?._id && (
              <>
                <Button
                  onClick={() => {
                    setEditMode(true);
                    setDialogOpen(false);
                  }}
                  variant="ghost"
                  className="cursor-pointer w-fit"
                >
                  Edit
                </Button>
                <Button
                  onClick={deletePostHandler}
                  variant="ghost"
                  className="cursor-pointer w-fit"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-4 w-4" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      <div className="border border-gray-200 my-4">
        <img
          className="rounded-sm w-full aspect-square object-cover"
          src={post.image[0].url}
          alt="Post Image"
        />
      </div>
      <div className="flex justify-between items-center my-2">
        <div className="flex gap-3 items-center">
          {liked ? (
            <FaHeart
              onClick={likeOrDislikePostHandler}
              size={"24px"}
              className="cursor-pointer text-red-600"
            />
          ) : (
            <FaRegHeart
              onClick={likeOrDislikePostHandler}
              size={"24px"}
              className="cursor-pointer"
            />
          )}
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPosts(post));
              setOpen(true);
            }}
            className="cursor-pointer hover:text-gray-600"
          />
          {/* <Send className="cursor-pointer hover:text-gray-600" /> */}
        </div>
        {isBookmarked ? (
          <BookmarkCheck
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        ) : (
          <Bookmark
            onClick={bookmarkHandler}
            className="cursor-pointer hover:text-gray-600"
          />
        )}
      </div>
      {postLikeCount > 0 && (
        <span className="font-medium mb-2 block">
          {postLikeCount} {postLikeCount === 1 ? "Like" : "Likes"}
        </span>
      )}

      {/* Edit Caption  */}
      <div className="flex justify-between items-center gap-2">
        <div>
          {editMode ? (
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="border focus-visible:ring-transparent p-1 rounded-md w-full"
              />
              <button onClick={updatePostHandler} disabled={updateLoading}>
                <Check className="text-green-500 cursor-pointer" />
              </button>
              <button onClick={() => setEditMode(false)}>
                <X className="text-red-500 cursor-pointer" />
              </button>
            </div>
          ) : (
            <p>
              <span className="font-medium mr-2">{post.author.username}</span>
              {post?.caption}
            </p>
          )}
        </div>
      </div>

      {totalCommentCount !== 0 && (
        <span
          onClick={() => {
            dispatch(setSelectedPosts(post));
            setOpen(true);
          }}
          className="cursor-pointer text-gray-400 text-sm"
        >
          View all {totalCommentCount} comments
        </span>
      )}

      <CommentDialog open={open} setOpen={setOpen} />
      <div className="flex items-center justify-between mt-1">
        <input
          type="text"
          placeholder="Add a comment..."
          value={text}
          onChange={changeEventHandler}
          className="outline-none w-full text-sm"
        />
        {text && (
          <span
            onClick={commentHandler}
            className="cursor-pointer text-[#3BADF8]"
          >
            Post
          </span>
        )}
      </div>
    </div>
  );
};

export default Post;
