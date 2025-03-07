import { MoreHorizontal, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Comment from "./Comment";
import { axiosInstance } from "@/lib/utils";
import { setPosts, setSelectedPosts } from "@/redux/postSlice";
import { toast } from "sonner";

// eslint-disable-next-line react/prop-types
const CommentDialog = ({ open, setOpen }) => {
  const [text, setText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const { posts, selectedPost } = useSelector((store) => store.post);
  const [comments, setComments] = useState([]);
  const dispatch = useDispatch();
  const inputRef = useRef(null);

  useEffect(() => {
    if (selectedPost) {
      setComments(selectedPost?.comments || []);
    }
  }, [selectedPost]);

  const changeEventHandler = (e) => {
    setText(e.target.value);
  };

  const handleReply = (commentId, username) => {
    setReplyingTo(commentId);
    setText(`@${username} `);
    inputRef.current.focus();
  };

  const commentHandler = async () => {
    if (!text.trim()) return;

    try {
      let res;
      if (replyingTo) {
        // Handle reply
        res = await axiosInstance.post(`/post/comment/${replyingTo}/reply`, {
          text,
        });
      } else {
        // Handle new comment
        res = await axiosInstance.post(`/post/${selectedPost?._id}/comment`, {
          text,
        });
      }

      if (res.data.success) {
        const updatedPosts = posts.map((post) => {
          if (post._id === selectedPost._id) {
            if (replyingTo) {
              const updatedComments = comments.map((comment) => {
                if (comment._id === replyingTo) {
                  return {
                    ...comment,
                    replies: [...comment.replies, res.data.data],
                  };
                }
                return comment;
              });
              return { ...post, comments: updatedComments };
            }
            return { ...post, comments: [...post.comments, res.data.data] };
          }
          return post;
        });

        dispatch(setPosts(updatedPosts));
        dispatch(
          setSelectedPosts(updatedPosts.find((p) => p._id === selectedPost._id))
        );
        setComments(
          updatedPosts.find((p) => p._id === selectedPost._id).comments
        );

        setText("");
        setReplyingTo(null);
        toast.success(res.data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        onInteractOutside={() => setOpen(false)}
        className="max-w-xs sm:max-w-md md:max-w-3xl lg:max-w-4xl xl:max-w-5xl p-0 flex flex-col"
      >
        <div className="flex flex-1">
          <div className="w-1/2 hidden md:flex">
            <img
              className="h-full w-full object-cover rounded-l-lg"
              src={selectedPost?.image[0].url}
              alt="Post"
            />
          </div>
          <div className="w-full md:w-1/2 flex flex-col justify-between">
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-3 items-center">
                  <Link to={`/${selectedPost?.author?.username}`}>
                    <Avatar>
                      <AvatarImage
                        src={selectedPost?.author?.profilePicture?.url}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div>
                    <Link className="font-semibold text-xs">
                      {selectedPost?.author?.username}
                    </Link>
                  </div>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <MoreHorizontal className="cursor-pointer" />
                  </DialogTrigger>
                  <DialogContent className="flex flex-col items-center text-sm text-center">
                    <div className="cursor-pointer w-full text-[#ED4956] font-bold">
                      Unfollow
                    </div>
                    {/* <div className="cursor-pointer w-full">
                      Add to Favourites
                    </div> */}
                  </DialogContent>
                </Dialog>
              </div>
            </div>
            <hr />
            <div className="flex-1 overflow-y-auto max-h-96">
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onReply={handleReply}
                />
              ))}
            </div>
            <div className="p-4">
              {replyingTo && (
                <div className="text-sm bg-gray-200 px-4 py-3 mb-1 flex items-center justify-between">
                  <div>
                    <span className="text-gray-700">Replying to</span>
                    <span className="text-blue-500">
                      {" "}
                      @
                      {
                        comments.find((c) => c._id === replyingTo)?.author
                          .username
                      }
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setText("");
                    }}
                    className="text-gray-400 hover:text-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder={
                    replyingTo ? "Write a reply..." : "Write a comment..."
                  }
                  className="outline-none w-full border border-gray-300 p-2 rounded text-gray-800 text-sm"
                  onChange={changeEventHandler}
                  value={text}
                />
                <Button
                  disabled={!text.trim()}
                  variant="outline"
                  onClick={commentHandler}
                >
                  {replyingTo ? "Reply" : "Post"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CommentDialog;