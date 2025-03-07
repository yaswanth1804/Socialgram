import { useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { useRef } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { axiosInstance, readFileAsDefaultUrl } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useDispatch } from "react-redux";
import {useNavigate} from "react-router-dom"
import { setAuthUser } from "@/redux/authSlice";
import { Textarea } from "./ui/textarea";


const EditProfile = () => {
  const { user } = useSelector((store) => store.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const imageRef = useRef();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [input, setInput] = useState({
    profilePicture: user?.profilePicture,
    bio: user?.bio,
    gender: user?.gender,
  });

  const fileChangeHandler = async (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setInput({ ...input, profilePicture: file });
        const dataUrl = await readFileAsDefaultUrl(file);
        setImagePreview(dataUrl);
      }
      e.target.value = "";
    };

  const selectChangeHandler = (value) => {
    setInput({...input, gender: value});
  }

  const editProfileHandler = async (e) => {
      e.preventDefault();
      setLoading(true);
      const formData = new FormData();
      formData.append("bio", input.bio);
      formData.append("gender", input.gender);
      if(input.profilePicture) {
        formData.append("profilePicture", input.profilePicture);
      }
    try {
        const res = await axiosInstance.post("/user/profile/edit", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        if(res.data.success){
            const updatedUserData = {
              ...user,
              bio: res?.data?.data?.bio,
              gender: res?.data?.data?.gender,
              profilePicture: res?.data?.data?.profilePicture,
            };
            dispatch(setAuthUser(updatedUserData));
            navigate(`/profile/${user?._id}`);
            toast.success(res.data.message);
        }
    } catch (error) {
        console.log("Error editing the profile", error);
        toast.error(error.response?.data?.message || "Error editing the profile")
    } finally {
        setLoading(false);
    }
  }

  return (
    <div className="flex max-w-2xl mx-auto pl-10">
      <section className="flex flex-col gap-6 w-full my-8">
        <h1 className="font-bold text-xl">Edit Profile</h1>
        <div className="flex items-center justify-between gap-2 bg-gray-100 rounded-xl p-4">
          <div className="flex items-center gap-3">
            {imagePreview ? (
              <Avatar>
                <AvatarImage src={imagePreview} alt="User Image" />
                <AvatarFallback />
              </Avatar>
            ) : (
              <Avatar>
                <AvatarImage src={user?.profilePicture?.url} alt="User Image" />
                <AvatarFallback />
              </Avatar>
            )}
            <div>
              <h1 className="text-sm font-semibold"> {user?.username} </h1>
              <span className="text-gray-600">
                {user?.bio || ""}
              </span>
            </div>
          </div>
          <input
            ref={imageRef}
            type="file"
            className="hidden"
            onChange={fileChangeHandler}
          />
          <Button
            onClick={() => imageRef?.current.click()}
            className="bg-[#0095F6] h-6 hover:bg-[#318bc7] p-4 rounded"
          >
            Change Photo
          </Button>
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Bio</h1>
          <Textarea
            className="focus-visible:ring-transparent"
            name="bio"
            value={input.bio}
            onChange={(e) => setInput({ ...input, bio: e.target.value })}
          />
        </div>
        <div>
          <h1 className="font-bold text-xl mb-2">Gender</h1>
          <Select
            defaultValue={input.gender}
            onValueChange={selectChangeHandler}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          {loading ? (
            <Button className="bg-[#0095F6] h-6 hover:bg-[#318bc7] p-4 rounded">
              Please Wait
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            </Button>
          ) : (
            <Button
              onClick={editProfileHandler}
              className="bg-[#0095F6] h-6 hover:bg-[#318bc7] p-4 rounded"
            >
              Submit
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default EditProfile;
