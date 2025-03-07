/* eslint-disable react/prop-types */
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteAllNotifications,
} from "@/redux/rtmSlice";

const Notifications = ({ open, setOpen }) => {
  const dispatch = useDispatch();

  const { notifications } = useSelector((store) => store.realTimeNotification);

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const handleDeleteAllNotifications = () => {
    dispatch(deleteAllNotifications());
  };

  const handleMarkAsRead = (notificationId) => {
    console.log("noti id", notificationId);
    dispatch(markNotificationAsRead({ id: notificationId }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="fixed top-0 left-0 bottom-0 w-[80%] md:w-[40%] bg-white p-6 rounded-lg shadow-lg overflow-y-auto transform transition-transform duration-300"
        style={{ transform: open ? "translateX(0)" : "translateX(-100%)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={notifications && notifications.length === 0}
            >
              Mark all as read
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteAllNotifications}
              disabled={notifications && notifications.length === 0}
            >
              Delete all
            </Button>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto mb-4">
            {notifications && notifications.length === 0 ? (
              <p className="text-center text-gray-500">No notifications</p>
            ) : (
              notifications &&
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`flex items-center cursor-pointer gap-4 justify-between my-2 p-3 border-b ${
                    !notification.isRead ? "bg-blue-50" : "bg-white"
                  }`}
                  onClick={() => handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Avatar className="w-10 h-10">
                      <AvatarImage
                        src={notification?.user?.profilePicture?.url}
                        alt={notification?.user?.username}
                      />
                      <AvatarFallback>CN</AvatarFallback>
                    </Avatar>
                    <p className="text-sm">
                      <span className="font-bold">
                        {notification?.user?.username}
                      </span>{" "}
                      {notification.type === "like" &&
                        `${notification.user.username} liked your post`}
                      {notification.type === "like_comment" &&
                        `${notification.user.username} liked your comment: "${notification.comment.text}"`}
                      {notification.type === "like_reply" &&
                        `${notification.user.username} liked your reply: "${notification.reply.text}"`}
                      {notification.type === "comment" &&
                        `${notification.user.username} commented: "${notification.comment.text}"`}
                      {notification.type === "reply" &&
                        `${notification.user.username} replied to your comment: "${notification.reply.text}"`}
                      {notification.type === "follow" &&
                        `${notification.user.username} started following you`}
                      {notification.type === "message" &&
                        `${notification.user.username} sent you a message`}
                    </p>
                  </div>
                  {notification?.post && (
                    <img
                      src={notification?.post?.image[0]?.url}
                      alt="Post"
                      className="mt-2 h-12 w-12 object-cover rounded-lg"
                    />
                  )}
                </div>
              ))
            )}
          </div>

          <div className="mt-4 text-right">
            <Button
              onClick={() => setOpen(false)}
              className="bg-red-600 text-white"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Notifications;
