import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { io } from 'socket.io-client';
import './App.css';
import Chat from './components/Chat';
import EditProfile from './components/EditProfile';
import Home from "./components/Home";
import Login from "./components/Login";
import MainLayout from "./components/MainLayout";
import Profile from './components/Profile';
import ProtectedRute from './components/ProtectedRute';
import Signup from './components/Signup';
import { setOnlineUsers } from './redux/chatSlice';
import { setNotification } from './redux/rtmSlice';
import { setSocket } from './redux/socketSlice';

const browserRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRute>
        <MainLayout />
      </ProtectedRute>
    ),
    children: [
      {
        path: "/",
        element: (
          <ProtectedRute>
            <Home />
          </ProtectedRute>
        ),
      },
      {
        path: "/profile/:id",
        element: (
          <ProtectedRute>
            <Profile />
          </ProtectedRute>
        ),
      },
      {
        path: "/account/edit",
        element: (
          <ProtectedRute>
            <EditProfile />
          </ProtectedRute>
        ),
      },
      {
        path: "/chat",
        element: (
          <ProtectedRute>
            <Chat />
          </ProtectedRute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
]);

function App() {
  const {user} = useSelector((store) => store.auth);
  const {socket} = useSelector((store) => store.socketio);
  const dispatch = useDispatch();

  useEffect(()=> {
    if(user){
      const socketio = io("http://localhost:4000", {
        query : { userId: user?._id },
        transports: ["websocket"]
      });
      dispatch(setSocket(socketio));

      //listen all the events
      socketio.on("getOnlineUsers", (onlineUser) => {
        dispatch(setOnlineUsers(onlineUser));
      });

      socketio.on("notification", (notification) => {
        console.log("notification", notification);
        dispatch(setNotification(notification));
      });

      return () => {
        socketio.close();
        dispatch(setSocket(null));
      }
    }
    else if(socket) {
      socket.close();
      dispatch(setSocket(null));
    }
  }, [user, dispatch]);
  return (
    <>
      <RouterProvider router={browserRouter} />
    </>
  );
}

export default App;
