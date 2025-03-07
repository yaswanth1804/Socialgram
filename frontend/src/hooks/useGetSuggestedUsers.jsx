import { axiosInstance } from "@/lib/utils";
import { setSuggestedUsers } from "@/redux/authSlice";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetSuggestedUsers = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axiosInstance("/user/suggested");
        if (res.data.success) {
          dispatch(setSuggestedUsers(res.data.data));
        }
      } catch (error) {
        console.error("Error fetching suggested users:", error);
        toast.error(error);
      }
    };
    fetchSuggestedUsers();
  }, [dispatch]);
};

export default useGetSuggestedUsers;
