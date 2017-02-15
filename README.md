# eWave Studio
A music production web app that was created as a Nashville Software School front-end capstone project.  It was created using HTML5, SCSS, & AngularJS and is deployed to Firebase: [eWave Studio](http://https://ewavestudio-e15d0.firebaseapp.com/#/login)

## Usage - Sign up to create a user. There are 4 page views after logging in:
1. Live audio input (connect an instrument to the computer via USB device -- [Example of cord needed](https://www.amazon.com/VAlinks-Interface-Connector-Instruments-GarageBand/dp/B01EV0V58A/ref=sr_1_2?ie=UTF8&qid=1487178040&sr=8-2&keywords=usb+guitar+cable)).  
  You can also trigger recording of audio using a connected USB MIDI foot control.
2. MIDI triggers (connect a MIDI device via USB ports -- [example of a basic MIDI keyboard] (https://www.amazon.com/midiplus-AKM320-MIDI-Keyboard-Controller/dp/B00VHKMK64/ref=sr_1_2?s=musical-instruments&ie=UTF8&qid=1487179038&sr=1-2&keywords=midi+keyboard)
3. Sequencer / Drum Machine (no external inputs are required to use this view.  However, if you have a USB connected instrument, you can utilize the effects processors and record audio to insert into the sequencer)
4. Computer Keyboard - Play an oscillator with your computer keyboard, using the top row of letters and the number row.

## API's used
1. Web Audio
2. Web MIDI
3. getUserMedia
4. MediaRecorder

## Styling
1. Animate.CSS
2. Bootstrap
3. Font-Awesome

## Installation
1. npm install
2. bower install

## Compatibility
Currently, audio input sections require use of Google Chrome.  Firefox compatibility coming.

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License
MIT License

Copyright (c) [2016] [Nick Chemsak]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


