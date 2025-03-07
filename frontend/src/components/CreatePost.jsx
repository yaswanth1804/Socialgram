import { AvatarImage } from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Dialog, DialogContent, DialogHeader } from "./ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { useRef } from "react";
import { useState } from "react";
import { axiosInstance, readFileAsDefaultUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { setPosts } from "@/redux/postSlice";

// eslint-disable-next-line react/prop-types
const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const {user} = useSelector((store) => store.auth);
  const {posts} = useSelector((store) => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const postFile = e.target.files?.[0];
    if (postFile) {
      setFile(postFile);
      const dataUrl = await readFileAsDefaultUrl(postFile);
      setImagePreview(dataUrl);
    }
    e.target.value = "";
  };

  const createPostHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("caption", caption);
    if(imagePreview) formData.append("image", file);
    try {
      const res = await axiosInstance.post("/post/new", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if(res.data.success){
        dispatch(setPosts([res.data.data, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      setLoading(false)
    }
  };
  return (
    <Dialog open={open}>
      <DialogContent onInteractOutside={() => setOpen(false)}>
        <DialogHeader className="text-center font-semibold">
          Create New Post
        </DialogHeader>
        <div className="flex gap-3 items-center" onClick={createPostHandler}>
          <Avatar>
            <AvatarImage src={user?.profilePicture?.url} alt="img" />
            <AvatarFallback></AvatarFallback>
          </Avatar>
          <div>
            <h1 className="font-semibold text-xs">{user?.username}</h1>
            <span className="text-gray-600 text-xs">{user?.bio}</span>
          </div>
        </div>
        <Textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="focus-visible:ring-transparent border-none"
          placeholder="Write a caption..."
        />
        {imagePreview && (
          <div className="relative">
            <div className="w-full h-64 flex items-center justify-center">
              <img
                className="h-full w-full object-cover rounded-md"
                src={imagePreview}
                alt="Image Preview"
              />
            </div>
            <div className="absolute top-1 right-1 cursor-pointer">
              <X
                onClick={() => {
                  setFile("");
                  setImagePreview("");
                }}
              />
            </div>
          </div>
        )}
        <input
          ref={imageRef}
          type="file"
          className="hidden"
          onChange={fileChangeHandler}
        />
        <Button
          onClick={() => imageRef.current.click()}
          className="w-fit mx-auto bg-[#0095F6] hover:bg-[#42b3ff]"
        >
          Select from computer
        </Button>
        {imagePreview &&
          (loading ? (
            <Button>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button
              onClick={createPostHandler}
              type="submit"
              className="w-full"
            >
              Post
            </Button>
          ))}
      </DialogContent>
    </Dialog>
  );
};

export default CreatePost;
