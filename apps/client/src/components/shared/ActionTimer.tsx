import Countdown from 'react-countdown';

interface ActionTimerProps {
  timeToActSeconds: number;
  onTimeUp: () => void;
}

export const ActionTimer = ({ timeToActSeconds, onTimeUp }: ActionTimerProps) => {
  return (
    <Countdown
      date={Date.now() + timeToActSeconds * 1000}
      onComplete={onTimeUp}
      renderer={({ seconds, completed }) => {
        if (completed) {
          return <span className="text-center block text-red-500">Time's up!</span>;
        }
        return (
          <div className="text-center block text-yellow-400">
            {seconds}s remaining
          </div>
        );
      }}
    />
  );
}; 