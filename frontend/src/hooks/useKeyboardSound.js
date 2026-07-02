const keyStrokeSounds = [
  new Audio("sounds/keystroke1.mp3"),
  new Audio("sounds/keystroke2.mp3"),
  new Audio("sounds/keystroke3.mp3"),
  new Audio("sounds/keystroke4.mp3"),
  new Audio("sounds/keystroke5.mp3"),
];

const useKeyboardSound = () => {
  const playRandomKeyStrokeSound = () => {
    const randomSound =
      keyStrokeSounds[Math.floor(Math.random() * keyStrokeSounds.length)];

    randomSound.currentTime = 0; // Reset the sound to the beginning
    randomSound.play().catch((error) => {
      console.error("Error playing sound:", error);
    });
  };

  return { playRandomKeyStrokeSound };
};

export default useKeyboardSound;
