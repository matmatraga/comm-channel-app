import ConversationItem from "./ConversationItem";

const ConversationList = ({
  conversations,
  users,
  currentUser,
  selectedPartner,
  onlineUsers,
  onSelectPartner,
  loading,
}) => {
  const items = [
    ...conversations,
    ...users
      .filter(
        (u) =>
          u._id !== currentUser?._id &&
          !conversations.some((c) => c.partner._id === u._id)
      )
      .map((u) => ({
        partner: u,
        lastMessage: "Start a conversation",
        lastMessageAt: null,
        unreadCount: 0,
      })),
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b dark:border-gray-700">
        <h2 className="text-lg font-bold">Messages</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-11 h-11 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No conversations yet</p>
        ) : (
          items.map(({ partner, lastMessage, lastMessageAt, unreadCount }) => (
            <ConversationItem
              key={partner._id}
              partner={partner}
              lastMessage={lastMessage}
              lastMessageAt={lastMessageAt}
              unreadCount={unreadCount}
              isOnline={onlineUsers.includes(partner._id)}
              isActive={selectedPartner?._id === partner._id}
              onClick={() => onSelectPartner(partner)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationList;
