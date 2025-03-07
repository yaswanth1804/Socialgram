import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { MessageCircle, Menu, X } from "lucide-react";
import Messages from "./Messages";
import { axiosInstance } from "@/lib/utils";
import { setMessages } from "@/redux/chatSlice";
import { setSelectedUser } from "@/redux/authSlice";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const { user, suggestedUsers, selectedUser } = useSelector(
    (store) => store.auth
  );
  const { onlineUsers, messages } = useSelector((store) => store.chat);
  let isOnline;

  const sendMessageHandler = async () => {
    try {
      const res = await axiosInstance.post(`message/send/${selectedUser._id}`, {
        message,
      });
      if (res.data.success) {
        dispatch(setMessages([...messages, res.data.data]));
        setMessage("");
      }
    } catch (error) {
      console.log("Error sending message", error);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(setSelectedUser(null));
    };
  }, []);

  return (
    <div className="flex h-screen relative md:pl-[12%] lg:pl-[20%]">
      {/* Mobile: Sidebar Toggle Button */}
      <button
        className="md:hidden fixed top-16 left-4 z-20 p-2 bg-gray-800 text-white rounded-full"
        onClick={() => setIsSidebarOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar (User List) */}
      <aside
        className={`inset-y-0 sm: w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:w-1/4`}
      >
        {/* Close Button (Mobile Only) */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-700"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={24} />
        </button>

        <h1 className="font-bold my-6 px-4 text-xl">{user?.username}</h1>
        <hr className="mb-4 border-gray-300" />
        <div className="overflow-y-auto h-[80vh] px-3">
          {suggestedUsers.map((suggestedUser) => {
            isOnline = onlineUsers.includes(suggestedUser._id);
            return (
              <div
                key={suggestedUser._id}
                onClick={() => {
                  dispatch(setSelectedUser(suggestedUser));
                  setIsSidebarOpen(false); // Close sidebar on selection
                }}
                className="flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={suggestedUser?.profilePicture?.url}
                    alt="User Image"
                  />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-medium">{suggestedUser?.username}</span>
                  <span
                    className={`text-xs font-bold ${
                      isOnline ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isOnline ? "online" : "offline"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Chat Area */}
      <main className="flex-1 border-l border-gray-300 flex flex-col h-full ml-[-20%] md:ml-1">
        {selectedUser ? (
          isOnline = onlineUsers.includes(selectedUser._id),
          <>
            {/* Chat Header */}
            <div className="flex gap-3 items-center px-4 py-3 border-b border-gray-300 sticky top-0 bg-white z-10">
              <Avatar>
                <AvatarImage
                  src={selectedUser?.profilePicture?.url}
                  alt="User Image"
                />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium">{selectedUser?.username}</span>
                <span
                  className={`text-xs font-bold ${
                    isOnline ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isOnline ? "online" : "offline"}
                </span>
              </div>
            </div>

            {/* Message Box */}
            <Messages selectedUser={selectedUser} />

            {/* Message Input */}
            <div className="flex w-full items-center p-3 border-t border-gray-300 fixed md:static md:w-auto bottom-0 left-0 bg-white z-50">
              <Input
                type="text"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none"
                placeholder="Type message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button onClick={sendMessageHandler}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center mx-auto">
            <MessageCircle className="w-24 h-24 my-4 text-gray-500" />
            <h1 className="font-medium text-xl">Your Messages</h1>
            <span>Send a message to start a chat</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default Chat;

