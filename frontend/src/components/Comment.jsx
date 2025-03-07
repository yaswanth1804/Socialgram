/* eslint-disable react/prop-types */
import { useState } from "react";
import { Heart, MoreHorizontal, Loader2, Check, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Dialog, DialogTrigger, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";
import { setSelectedPosts } from "@/redux/postSlice";
import Reply from "./Reply";
import { FaHeart } from "react-icons/fa";
import { Minus } from "lucide-react";

const Comment = ({ comment, onReply }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedPost } = useSelector((store) => store.post);
  const [editMode, setEditMode] = useState(false);
  const [editComment, setEditComment] = useState(comment.text);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openReply, setOpenReply] = useState(false);
  const [liked, setLiked] = useState(comment.likes.includes(user?._id));
  const [commentLikeCount, setCommentLikeCount] = useState(
    comment.likes.length
  );
  const isAuthorized = user?._id === comment?.author?._id;

  const handleOpenReply = () => {
    setOpenReply(!openReply)
  }

  const handleEdit = async () => {
    if (!editComment.trim()) return toast.error("Comment cannot be empty!");
    try {
      const res = await axiosInstance.put(
        `/post/comment/${comment._id}/update`,
        {
          text: editComment,
        }
      );
      if (res.data.success) {
        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((c) =>
            c._id === comment._id ? { ...c, text: editComment } : c
          ),
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
        `/post/comment/${comment._id}/delete`
      );
      if (res.data.success) {
        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.filter((c) => c._id !== comment._id),
        };
        dispatch(setSelectedPosts(updatedPost));
        toast.success("Comment deleted");
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
        `/post/comment/${comment._id}/${action}`
      );
      if (res.data.success) {
        setLiked(!liked);
        setCommentLikeCount((prev) => (liked ? prev - 1 : prev + 1));

        const updatedPost = {
          ...selectedPost,
          comments: selectedPost.comments.map((c) => {
            if (c._id === comment._id) {
              return {
                ...c,
                likes: liked
                  ? c.likes.filter((id) => id !== user._id)
                  : [...c.likes, user._id],
              };
            }
            return c;
          }),
        };
        dispatch(setSelectedPosts(updatedPost));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Action failed");
    }
  };

  return (
    <div className="flex items-start gap-3 my-2 group p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author?.profilePicture?.url} />
        <AvatarFallback>{comment.author.username[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-bold mr-2">{comment.author.username}</span>
            {editMode ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
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
              <span className="text-gray-800">{comment.text}</span>
            )}
          </div>
          <button onClick={handleLike} className="ml-2">
            {liked ? (
              <FaHeart className="h-4 w-4 text-red-500" />
            ) : (
              <Heart className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
          <span>
            {new Date(comment.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {commentLikeCount > 0 && (
            <span>
              {commentLikeCount} {""}
              {commentLikeCount > 1 ? "likes" : "like"}{" "}
            </span>
          )}
          <button
            onClick={() => onReply(comment._id, comment.author.username)}
            className="hover:text-gray-700"
          >
            Reply
          </button>
          {isAuthorized && (
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger>
                <MoreHorizontal className="h-4 w-4 cursor-pointer opacity-0 group-hover:opacity-100" />
              </DialogTrigger>
              <DialogContent className="max-w-sm flex flex-col items-center">
                <DialogTitle></DialogTitle>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setEditMode(true);
                    setOpenDialog(false);
                  }}
                  className="cursor-pointer w-fit"
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="cursor-pointer w-fit text-red-500"
                >
                  {deleteLoading ? (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  ) : (
                    "Delete"
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          )}
        </div>
        {comment.replies?.length > 0 && (
          <>
            <span
              className="flex items-center justify-start text-xs gap-2 mt-1 text-gray-500 cursor-pointer"
              onClick={handleOpenReply}
            >
              <Minus />
              {openReply
                ? "Hide Replies"
                : "View replies" + " (" + comment.replies?.length + ")"}
            </span>
            {openReply && (
              <div className="ml-1 mt-2 border-l-2 pl-2">
                {comment.replies.map((reply) => (
                  <Reply
                    key={reply._id}
                    reply={reply}
                    commentId={comment._id}
                    onReply={onReply}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Comment;