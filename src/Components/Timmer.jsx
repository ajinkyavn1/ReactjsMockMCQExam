import React, { useEffect, useState } from 'react';

export default function Timer({ autoSubmit, isTestStarted }) {
  const [seconds, setSeconds] = useState(600);

  useEffect(() => {
    let interval;
    if (isTestStarted && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds - 1);
      }, 1000);
    } else if (seconds === 0) {
      autoSubmit(); 
    }

    return () => clearInterval(interval);
  }, [seconds, autoSubmit, isTestStarted]);

  useEffect(() => {
    if (!isTestStarted) {
      setSeconds(600);
    }
  }, [isTestStarted]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="timer">
      <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Test Ends in : {formatTime(seconds)}</span>
    </div>
  );
}
