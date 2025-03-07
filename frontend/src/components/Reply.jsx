/* eslint-disable react/prop-types */
import { useState } from "react";
import { Heart, MoreHorizontal, Loader2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";
import { setSelectedPosts } from "@/redux/postSlice";
import { FaHeart } from "react-icons/fa";

const Reply = ({ reply, commentId, onReply }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedPost } = useSelector((store) => store.post);
  const [editMode, setEditMode] = useState(false);
  const [editText, setEditText] = useState(reply.text);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [liked, setLiked] = useState(reply?.likes?.includes(user?._id));
  const [replyLikeCount, setReplyLikeCount] = useState(reply.likes.length);
  const isAuthorized = user?._id === reply?.author?._id;

  const parseCommentText = (text) => {
    // This regex finds words starting with @
    const regex = /(@\w+)/g;
    const parts = text.split(regex);
    return parts.map((part, index) => {
      // If the part matches an @mention, render a clickable Link
      if (part.match(/^@\w+/)) {
        return (
          <span
            key={index}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      // Otherwise, render the text normally
      return <span key={index}>{part}</span>;
    });
  };

  const handleEdit = async () => {
    if (!editText.trim()) return toast.error("Reply cannot be empty!");
    try {
      const res = await axiosInstance.put(
        `/post/comment/reply/${reply._id}/update`,
        {
          text: editText,
        }
      );
      if (res.data.success) {
        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment.replies.map((r) =>
                  r._id === reply._id ? { ...r, text: editText } : r
                ),
              };
            }
            return comment;
          }),
        };
        dispatch(setSelectedPosts(updatedPost));
        setEditMode(false);
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await axiosInstance.delete(
        `/post/comment/reply/${reply._id}/delete`
      );
      if (res.data.success) {
        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment.replies.filter((r) => r._id !== reply._id),
              };
            }
            return comment;
          }),
        };
        dispatch(setSelectedPosts(updatedPost));
        toast.success("Reply deleted");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Delete failed");
    } finally {
      setDeleteLoading(false);
      setOpenDialog(false);
    }
  };

  const handleLike = async () => {
    try {
      const action = liked ? "dislike" : "like";
      const res = await axiosInstance.put(
        `/post/comment/reply/${reply._id}/${action}`
      );
      if (res.data.success) {
        setLiked(!liked);
        setReplyLikeCount((prev) => (liked ? prev - 1 : prev + 1));

        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((comment) => {
            if (comment._id === commentId) {
              return {
                ...comment,
                replies: comment.replies.map((r) => {
                  if (r._id === reply._id) {
                    return {
                      ...r,
                      likes: liked
                        ? r.likes.filter((id) => id !== user._id)
                        : [...r.likes, user._id],
                    };
                  }
                  return r;
                }),
              };
            }
            return comment;
          }),
        };
        dispatch(setSelectedPosts(updatedPost));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="flex items-start gap-3 my-2 group p-2 hover:bg-gray-50 rounded-lg">
      <Avatar className="h-6 w-6">
        <AvatarImage src={reply.author?.profilePicture?.url} />
        <AvatarFallback>{reply.author.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-bold mr-2">{reply.author.username}</span>
            {editMode ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="border rounded px-2 py-1 text-sm"
                />
                <Check
                  className="h-4 w-4 text-green-500 cursor-pointer"
                  onClick={handleEdit}
                />
                <X
                  className="h-4 w-4 text-red-500 cursor-pointer"
                  onClick={() => setEditMode(false)}
                />
              </div>
            ) : (
              <span className="text-gray-800">
                {parseCommentText(reply.text)}
              </span>
            )}
          </div>
          <button onClick={handleLike} className="flex items-center gap-1">
            {liked ? (
              <FaHeart className="h-3 w-3 text-red-500" />
            ) : (
              <Heart className="h-3 w-3 text-gray-600" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>
            {new Date(reply.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {replyLikeCount > 0 && (
            <span>
              {replyLikeCount} {""}
              {replyLikeCount > 1 ? "likes" : "like"}{" "}
            </span>
          )}

          <button
            onClick={() => onReply(reply.comment, reply.author.username)}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Reply
          </button>

          {isAuthorized && (
            <>
              <MoreHorizontal
                className="h-4 w-4 cursor-pointer opacity-0 group-hover:opacity-100"
                onClick={() => setOpenDialog(true)}
              />
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="max-w-sm flex flex-col items-center">
                  <Button
                    variant="ghost"
                    className="cursor-pointer w-fit"
                    onClick={() => {
                      setEditMode(true);
                      setOpenDialog(false);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-fit cursor-pointer text-red-500"
                    onClick={handleDelete}
                    disabled={deleteLoading}
                  >
                    {deleteLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reply;