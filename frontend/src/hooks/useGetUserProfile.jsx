import { axiosInstance } from "@/lib/utils";
import { setUserProfile } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await axiosInstance(`/user/${userId}/profile`);
        if (res.data.success) {
          dispatch(setUserProfile(res.data.data));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        toast.error(error.response.data.message);
      }
    };
    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
