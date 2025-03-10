import { setMessages } from "@/redux/chatSlice";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const useGetRTM = () => {
  const dispatch = useDispatch();
  const { messages } = useSelector((store) => store.chat);
  const {socket} = useSelector((store) => store.socketio);

  useEffect(() => {
    socket.on("newMessage", (newMessage) => {
        dispatch(setMessages([...messages, newMessage]));
    });

    return () => {
        socket.off("newMessage");
    }
  }, [messages, setMessages]);
};

export default useGetRTM;
