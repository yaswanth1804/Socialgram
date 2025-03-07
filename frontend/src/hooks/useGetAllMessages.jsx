import { axiosInstance } from "@/lib/utils";
import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const useGetAllMessages = () => {
  const dispatch = useDispatch();
  const { selectedUser } = useSelector((store) => store.auth);

  useEffect(() => {
    const fetchAllMessages = async () => {
      try {
        const res = await axiosInstance(`/message/all/${selectedUser._id}`);
        if (res.data.success) {
          dispatch(setMessages(res.data.data));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error(error.response.data.message);
      }
    };
    fetchAllMessages();
  }, [selectedUser, dispatch]);
};

export default useGetAllMessages;
