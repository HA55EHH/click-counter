import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import "./styles.css";

const quotes = [
  "“The more you bet, the more you win when you win!”",
  "“Fortune favors the bold.”",
  "“You miss 100% of the shots you don’t take.”",
  "“Take a chance and win big!”",
  "“Go big or go home.”",
  "“Every spin could be the win of a lifetime.”",
  "“Dare to dream, dare to win.”",
  "“Luck is what happens when preparation meets opportunity.”",
  "“You can’t win if you don’t play.”",
  "“Bet smart, win smarter.”",
  "“Chase the thrill, embrace the win.”",
  "“All it takes is one lucky break.”",
  "“The next bet could change your life.”",
  "“Keep spinning, your luck is just around the corner.”",
  "“No guts, no glory.”",
  "“One spin away from your biggest win!”",
  "“Fortune rewards the fearless.”",
  "“You can’t win big by playing it safe.”",
  "“The next bet could be your biggest win yet.”",
  "“Spin now, worry later.”",
  "“It's only a gambling problem if you lose.”",
];

const getRandomQuote = (currentQuote: string) => {
  let newQuote;
  do {
    newQuote = quotes[Math.floor(Math.random() * quotes.length)];
  } while (newQuote === currentQuote);
  return newQuote;
};

function App() {
  const [clickCount, setClickCount] = useState(0);
  const [pausedState, setPausedState] = useState(0); // 0: running, 1: paused
  const [randomQuote, setRandomQuote] = useState(getRandomQuote(""));
  const ignoreNext = useRef(0);

  useEffect(() => {
    const unlistenIncrement = listen("increment", () => {
      if (pausedState === 0 && ignoreNext.current === 0) {
        setClickCount((prevCount) => prevCount + 1);
      }
      ignoreNext.current = 0;
    });

    const unlistenDecrement = listen("decrement", () => {
      if (pausedState === 0 && ignoreNext.current === 0) {
        setClickCount((prevCount) => Math.max(0, prevCount - 1));
      }
      ignoreNext.current = 0;
    });

    return () => {
      unlistenIncrement.then((unsub) => unsub());
      unlistenDecrement.then((unsub) => unsub());
    };
  }, [pausedState]);

  const handlePause = () => {
    ignoreNext.current = 1;
    setPausedState((prevState) => (prevState === 0 ? 1 : 0));
  };

  const handleReset = () => {
    setClickCount(0);
    ignoreNext.current = 1;
    setRandomQuote((prevQuote) => getRandomQuote(prevQuote));
  };

  const handleIncrement = () => {
    if (ignoreNext.current === 0 && pausedState === 0) {
      setClickCount((prevCount) => prevCount + 1);
    }
    ignoreNext.current = 1;
  };

  const handleDecrement = () => {
    if (ignoreNext.current === 0 && pausedState === 0) {
      setClickCount((prevCount) => Math.max(0, prevCount - 1));
    }
    ignoreNext.current = 1;
  };

  return (
    <div
      style={{
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        userSelect: "none",
      }}
      className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500 text-white"
    >
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-full max-h-full">
        <h1 className="text-4xl font-extrabold text-indigo-600 mb-6 sm:text-5xl md:text-6xl">
          Click Counter
        </h1>
        <div className="mt-8 flex justify-center items-center space-x-4">
          <button
            onMouseDown={handleDecrement}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 focus:outline-none transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            -
          </button>
          <h2 className="text-7xl font-extrabold text-indigo-600 transition-transform transform hover:scale-110 sm:text-8xl md:text-9xl">
            {clickCount}
          </h2>
          <button
            onMouseDown={handleIncrement}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 focus:outline-none transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            +
          </button>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onMouseDown={handlePause}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 focus:outline-none transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {pausedState === 0 ? "Pause" : "Resume"}
          </button>
          <button
            onMouseDown={handleReset}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-500 text-white rounded-full shadow-lg hover:bg-gray-600 focus:outline-none transition duration-300 ease-in-out transform hover:-translate-y-1"
          >
            Reset
          </button>
        </div>
        {randomQuote && (
          <div className="mt-8 flex justify-center">
            <blockquote className="italic text-lg text-gray-800 w-64 sm:w-80 h-16 text-center overflow-hidden">
              {randomQuote}
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
