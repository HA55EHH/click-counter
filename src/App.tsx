import { useState, useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import "./styles.css";

const quotes = [
  "The more you bet, the more you win when you win!",
  "Fortune favors the bold.",
  "You miss 100% of the shots you don’t take.",
  "Take a chance and win big!",
  "Go big or go home.",
  "Every spin could be the win of a lifetime.",
  "Dare to dream, dare to win.",
  "Luck is what happens when preparation meets opportunity.",
  "You can’t win if you don’t play.",
  "Bet smart, win smarter.",
  "Chase the thrill, embrace the win.",
  "All it takes is one lucky break.",
  "The next bet could change your life.",
  "Keep spinning, your luck is just around the corner.",
  "No guts, no glory.",
  "One spin away from your biggest win!",
  "Fortune rewards the fearless.",
  "You can’t win big by playing it safe.",
  "The next bet could be your biggest win yet.",
  "Spin now, worry later.",
  "It's only a gambling problem if you lose.",
  "Why not double down?",
  "That horse that you can't stop thinking about? He's going to win.",
  "They're laughing at you.",
  "Coward.",
  "Pussy.",
  "Do it.",
  "You can stop any time you want.",
  "You're due for a win...",
  "There's definitely a pattern...",
  "It's not real money...",
  "💰💰💰💰💰💰",
  "💵💵💵💵💵💵",
  "🤑🤑🤑🤑🤑🤑",
  "You don't have a problem.",
  "Don't think about it, just do it.",
  "Stop THINKING and start BETTING.",
  "It's not a gambling problem if you win.",
  "Money won is twice as sweet as money earned.",
  "Eat. Sleep. Spin. Repeat.",
  "There's always tomorrow...",
  "Another day, another spin.",
  "https://uk.jbl.com/bluetooth-speakers/ 👀",
  "Win today so that you have money to gamble tomorrow.",
  "That PS5 Pro ain't gonna pay for itself...",
  "It's not gambling when you know you're going to win.",
  "FACT: 90% of gamblers quit before they win big.",
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
  const [pausedState, setPausedState] = useState(false);
  const [randomQuote, setRandomQuote] = useState(getRandomQuote(""));
  const ignoreNext = useRef(false);

  useEffect(() => {
    const unlistenIncrement = listen("increment", () => {
      if (!pausedState && !ignoreNext.current) {
        setClickCount((prevCount) => prevCount + 1);
      }
      ignoreNext.current = false;
    });

    const unlistenDecrement = listen("decrement", () => {
      if (!pausedState && !ignoreNext.current) {
        setClickCount((prevCount) => Math.max(0, prevCount - 1));
      }
      ignoreNext.current = false;
    });

    return () => {
      unlistenIncrement.then((unsub) => unsub());
      unlistenDecrement.then((unsub) => unsub());
    };
  }, [pausedState]);

  const handlePause = () => {
    ignoreNext.current = true;
    setPausedState((prevState) => !prevState);
  };

  const handleReset = () => {
    setClickCount(0);
    ignoreNext.current = true;
    setRandomQuote(getRandomQuote(randomQuote));
  };

  const handleIncrement = () => {
    if (!ignoreNext.current && !pausedState) {
      setClickCount((prevCount) => prevCount + 1);
    }
    ignoreNext.current = true;
  };

  const handleDecrement = () => {
    if (!ignoreNext.current && !pausedState) {
      setClickCount((prevCount) => Math.max(0, prevCount - 1));
    }
    ignoreNext.current = true;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-blue-600 to-teal-400 text-gray-100 font-sans select-none">
      <div className="text-center p-8 bg-transparent rounded-lg max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-white mb-6">
          Click Counter
        </h1>
        <div className="mt-8 flex justify-center items-center space-x-6">
          <button
            onClick={handleDecrement}
            className="w-12 h-12 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-full shadow-md transition-transform transform hover:-translate-y-1 focus:outline-none"
            aria-label="Decrement"
          >
            &minus;
          </button>
          <h2 className="text-6xl font-bold text-white">{clickCount}</h2>
          <button
            onClick={handleIncrement}
            className="w-12 h-12 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white rounded-full shadow-md transition-transform transform hover:-translate-y-1 focus:outline-none"
            aria-label="Increment"
          >
            &#43;
          </button>
        </div>
        <div className="mt-8 flex justify-center space-x-4">
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full shadow-md transition-transform transform hover:-translate-y-1 focus:outline-none"
          >
            {pausedState ? "Resume" : "Pause"}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 active:bg-gray-800 text-white rounded-full shadow-md transition-transform transform hover:-translate-y-1 focus:outline-none"
          >
            Reset
          </button>
        </div>
        {randomQuote && (
          <div className="mt-10 px-4">
            <blockquote className="italic text-lg text-white bg-black bg-opacity-20 p-4 rounded-lg shadow-inner h-20 flex items-center justify-center overflow-hidden">
              {randomQuote}
            </blockquote>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
