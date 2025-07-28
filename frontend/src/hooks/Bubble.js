import botBubble from '../../icons/bot.png';
import userBubble from '../../icons/user.png';

const Bubble = ({ type, text }) => {
  const bubbleClass = type === 'bot' ? 'bubble bot' : 'bubble user';
  return (
    <div className={bubbleClass} style={{ backgroundImage: `url(${type === 'bot' ? botBubble : userBubble})` }}>
      <span className="bubble-text">{text}</span>
    </div>
  );
};

export default Bubble;