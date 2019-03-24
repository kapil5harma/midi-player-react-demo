import React, { Component } from 'react';
import './App.css';
import Soundfont from 'soundfont-player';
import MidiPlayer from 'midi-player-js';

var Player;

var changeTempo = function(tempo) {
  Player.tempo = tempo;
};

var play = function() {
  Player.play();
  document.getElementById('play-button').innerHTML = 'Stop';
};

var pause = function() {
  Player.pause();
  document.getElementById('play-button').innerHTML = 'Play';
};

var stop = function() {
  Player.stop();
  document.getElementById('play-button').innerHTML = 'Play';
};

class App extends Component {
  state = {
    isPlaying: false
  };

  clickHandler = () => {
    const { isPlaying } = this.state;
    console.log('isPlaying: ', isPlaying);
    if (isPlaying) {
      this.setState(
        currentState => {
          console.log('currentState: ', currentState);
          return { isPlaying: !currentState.isPlaying };
        },
        () => {
          stop();
        }
      );
    } else {
      const AudioContext = window.AudioContext || window.webkitAudioContext || false;
      const ac = new AudioContext();
      Soundfont.instrument(
        ac,
        'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_guitar_nylon-mp3.js'
      ).then(instrument => {
        const loadFile = () => {
          var file = document.querySelector('input[type=file]').files[0];
          var reader = new FileReader();
          if (file) reader.readAsArrayBuffer(file);

          reader.addEventListener(
            'load',
            () => {
              Player = new MidiPlayer.Player(event => {
                if (event.name == 'Note on') {
                  instrument.play(event.noteName, ac.currentTime, { gain: event.velocity / 100 });
                }

                document.getElementById('tempo-display').innerHTML = Player.tempo;
                document.getElementById('file-format-display').innerHTML = Player.format;
                document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
              });

              Player.loadArrayBuffer(reader.result);
              console.log('this: ', this);
              this.setState(
                currentState => {
                  console.log('currentState: ', currentState);
                  return { isPlaying: !currentState.isPlaying };
                },
                () => {
                  play();
                }
              );
            },
            false
          );
        };
        loadFile();
      });
    }
  };

  render() {
    const { isPlaying } = this.state;
    return (
      <div className='App'>
        <header className='header'>MIDI Player React Demo</header>
        <main className='main'>
          <input type='file' name='file' id='file' />
          <button id='play-button' onClick={this.clickHandler}>
            {!isPlaying ? 'Play' : 'Stop'}
          </button>
          <div className='bar'>
            <span id='play-bar' />
          </div>
          <div>
            Tempo: <span id='tempo-display'>0</span>
          </div>
          <div>
            File Format: <span id='file-format-display'>NA</span>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
