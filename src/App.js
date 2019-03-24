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
    isPlaying: false,
    tempo: 120
  };

  clickHandler = () => {
    const { isPlaying, tempo } = this.state;
    if (isPlaying) {
      this.setState(
        currentState => {
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
                // document.getElementById('file-format-display').innerHTML = Player.format;
                // document.getElementById('play-bar').style.width = 100 - Player.getSongPercentRemaining() + '%';
              });

              Player.loadArrayBuffer(reader.result);

              this.setState(
                currentState => {
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

  tempoChangeHandler = e => {
    const tempo = e.currentTarget.value;
    this.setState({ tempo }, () => changeTempo(tempo));
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
          <input
            type='range'
            name='range'
            value={this.state.tempo}
            id='range'
            min='50'
            max='200'
            onChange={e => this.tempoChangeHandler(e)}
          />
          <div>
            Tempo: <span id='tempo-display'>{this.state.tempo}</span>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
