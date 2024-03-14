import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, TouchableWithoutFeedback, Image } from 'react-native';

const App = () => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [score, setScore] = useState(0);
  const [popped, setPopped] = useState(0);
  const [missed, setMissed] = useState(0);
  const [missedDuringGame, setMissedDuringGame] = useState(0); // New state to track missed balloons during the game
  const [gameStarted, setGameStarted] = useState(false);
  const [balloons, setBalloons] = useState([]);
  const [initialSpeed, setInitialSpeed] = useState(1); // Initial speed
  const [gameOver, setGameOver] = useState(false);

  // Balloon image sources
  const balloonImages = [
    require('./assets/blue.png'),
    require('./assets/red.png'),
    require('./assets/purple.png'),
    require('./assets/yellow.png'),
    require('./assets/green.png'),
  ];

  useEffect(() => {
    let intervalId;
    if (gameStarted) {
      intervalId = setInterval(() => {
        setTimeLeft(prevTimeLeft => {
          if (prevTimeLeft === 0) {
            clearInterval(intervalId);
            setGameStarted(true);
            setGameOver(false);
             setMissed(prevMissed => prevMissed + 1); // Update missed count with missed during game
             setMissedDuringGame(0); // Reset missed during game count
          }
          return prevTimeLeft > 0 ? prevTimeLeft - 1 : prevTimeLeft;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [gameStarted, missedDuringGame]);

  useEffect(() => {
    if (timeLeft === 0) {
      endGame();
    }
  }, [timeLeft]);

  const startGame = () => {
    setTimeLeft(120); 
    setScore(0);
    setMissed(0);
    setPopped(0);
    setGameStarted(true);
    setGameOver(false);
    setInitialSpeed(1); // Reset initial speed
    setMissedDuringGame(0); // Reset missed during game count
    generateRandomBalloons();
  };

  const endGame = () => {
    setGameStarted(false);
    setGameOver(true);
    setMissed(prevMissed => prevMissed + missedDuringGame); // Update missed count with missed during game
  };

  const popBalloon = (id) => {
    if (!gameOver) {
      setScore(prevScore => prevScore + 2);
      setPopped(prevPopped => prevPopped + 1);
      setBalloons(balloons.filter(balloon => balloon.id !== id));
    }
  };

  const missBalloon = () => {
    if (!gameOver) {
      setMissedDuringGame(prevMissed => prevMissed + 1);
      //setScore(prevScore => prevScore - 1); // Update missed count
    }
  };

  const generateRandomNumber = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  const generateRandomBalloons = () => {
    if (!gameOver) {
      const intervalId = setInterval(() => {
        const left = generateRandomNumber(0, 300); // Adjust as needed
        const translateY = new Animated.Value(0); // Add Animated value for vertical movement

        const imageIndex = generateRandomNumber(0, balloonImages.length - 1); // Select a random image index
        const imageSource = balloonImages[imageIndex]; // Get the image source

        const newBalloon = {
          id: Date.now(),
          left,
          translateY,
          speed: initialSpeed,
          imageSource, // Add the image source to the balloon object
        };

        setBalloons(prevBalloons => [...prevBalloons, newBalloon]);

        // Increase initial speed for the next balloon
        setInitialSpeed(prevSpeed => prevSpeed * 1.2); // Adjust the factor to increase speed

        // Animate balloon movement
        Animated.timing(newBalloon.translateY, {
          toValue: -450, // Move the balloon upwards by 500 units (adjust as needed)
          duration: 2000 / initialSpeed, // Adjust speed based on balloon's speed
          useNativeDriver: true
        }).start(({ finished }) => {
          if (finished) {
            // Remove the balloon if animation is finished
            setBalloons(prevBalloons => prevBalloons.filter(b => b.id !== newBalloon.id));
            missBalloon(); // Update missed count
          }
        });

        if (timeLeft === 0) {
          clearInterval(intervalId);
        }
      }, 500); // Adjust balloon generation frequency (every 5 seconds)
    }
  };

  const playAgain = () => {
    setScore(0);
    setMissed(0);
    setPopped(0);
    startGame();
  };

  return (
    <View style={styles.container}>
      {!gameStarted && !gameOver ? (
        <View style={styles.splash}>
          <Text style={styles.title}>Balloon Popper</Text>
          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>Start</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.gameContainer}>
          <View style={styles.header}>
            <Text style={[styles.scoreboardText, styles.flashyCard]}>Time Left: {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</Text>
            <View style={styles.scoreboard}>
              <View style={[styles.scoreboardItem, styles.flashyCard]}>
                <Text style={styles.scoreboardText}>Score: {score}</Text>
              </View>
              <View style={[styles.scoreboardItem, styles.flashyCard]}>
                <Text style={styles.scoreboardText}>Missed:  {missed}</Text>
              </View>
              <View style={[styles.scoreboardItem, styles.flashyCard]}>
                <Text style={styles.scoreboardText}>Popped: {popped}</Text>
              </View>
            </View>
          </View>
          <View style={styles.balloonContainer}>
            {balloons.map(balloon => (
              <TouchableWithoutFeedback key={balloon.id} onPress={() => popBalloon(balloon.id)}>
                <Animated.View
                  style={[
                    styles.balloon,
                    { left: balloon.left, transform: [{ translateY: balloon.translateY }] }
                  ]}
                >
                  <Image
                    source={balloon.imageSource}
                    style={styles.balloonImage}
                  />
                </Animated.View>
              </TouchableWithoutFeedback>
            ))}
          </View>
          {gameOver && (
            <View style={styles.gameOverContainer}>
              <Text style={styles.gameOverText}>Game Over</Text>
              <Text style={styles.finalScoreText}>Final Score: {score}</Text>
              <TouchableOpacity style={styles.playAgainButton} onPress={playAgain}>
                <Text style={styles.playAgainButtonText}>Play Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#756394',
  },
  splash: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  startButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ff9800',
    borderRadius: 5,
  },
  startButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  gameContainer: {
    flex: 1,
  },
  header: {
    backgroundColor: '#382955',
    padding: 10,
    paddingTop: 40,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderBottomColor: '#756394',
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  scoreboardItem: {
    alignItems: 'center',
    paddingRight: 10,
  },
  scoreboardText: {
    fontSize: 16,
    color: '#fff',
  },
  flashyCard: {
    backgroundColor: '#ff9800',
    borderRadius: 10,
    padding: 10,
    margin:5,
    elevation: 5,
  },
  balloonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  balloon: {
    position: 'absolute',
    bottom: 0,
    zIndex: 1,
  },
  balloonImage: {
    width: 60,
    height: 130,
  },
  gameOverContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  finalScoreText: {
    fontSize: 18,
    marginBottom: 10,
  },
  playAgainButton: {
    padding: 10,
    backgroundColor: '#ff9800',
    borderRadius: 5,
  },
  playAgainButtonText: {
    fontSize: 18,
    color: '#fff',
  },
});

export default App;
