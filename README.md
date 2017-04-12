# eWave Studio
A music production web app created as a Nashville Software School front-end capstone project.  It utilizes HTML5, AngularJS, Bootstrap, Web Audio API, and Web MIDI API.  It is deployed to Firebase: [eWave Studio](https://ewavestudio-e15d0.firebaseapp.com/#/login)

## Installation
* $ cd lib
* npm install
* bower install

## Firebase and fb-creds.js
If you want to use Firebase authentication and have login functionality enabled for this app, the file <code>app/values/fb-creds.js</code> must be amended with a Firebase API key.  These were left out purposefully as to not expose the API key when pushing to Github.

## Usage -
### There are 4 main page views:
1. <strong>Live audio input:</strong> <a href="https://www.amazon.com/VAlinks-Interface-Connector-Instruments-GarageBand/dp/B01EV0V58A/ref=sr_1_2?ie=UTF8&qid=1487178040&sr=8-2&keywords=usb+guitar+cable">Example of Cord Needed</a> <br>
  Connect an instrument to the computer via USB device <br>
  You can also trigger recording of audio using a connected USB MIDI foot control to use in a loop.
2. <strong>MIDI:</strong> <a href="https://www.amazon.com/midiplus-AKM320-MIDI-Keyboard-Controller/dp/B00VHKMK64/ref=sr_1_2?s=musical-instruments&ie=UTF8&qid=1487179038&sr=1-2&keywords=midi+keyboard" target="_blank">Example of a basic MIDI controller</a> <br>
  Connect a MIDI device via USB ports to access oscillators and samples
3. <strong>Sequencer / Drum Machine:</strong> <br>
  Create a drum beat and looped audio.  <br>
  No external inputs are required to use this view.  However, IF you have a USB connected instrument, you can utilize the effects processors and record audio to insert into the sequencer.
4. <strong>Computer Keyboard: </strong>  <br>
  Play an oscillator with your computer keyboard, using the top row of letters and the number row.<br>
  No external inputs required to use this view.

## API's used
* Web Audio
* Web MIDI
* getUserMedia
* MediaRecorder

## Styling
* Animate.css (3.5.1)
* Bootstrap (3.3.7)
* Font-Awesome (4.7.0)
* Google fonts: 'Space Mono', 'Raleway'

## Contributing
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push the branch: `git push origin my-new-feature`
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


