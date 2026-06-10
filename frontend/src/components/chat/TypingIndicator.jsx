const TypingIndicator = ({ name }) => (
  <div className="flex items-center gap-2 px-2 py-1">
    <div className="flex gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
    </div>
    <span className="text-xs text-gray-500">{name} is typing...</span>
  </div>
);

export default TypingIndicator;
