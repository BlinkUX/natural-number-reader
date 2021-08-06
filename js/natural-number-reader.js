// Declare Variables
let d = 0;
let p = 0;
let s = 0;
let l = 0;
let loadString = '';
let inputString = '';
let playbackPattern = '';
let sounds = [];
let nowPlaying = false;
let requestNewMode = true;
let playNewMode = true;

// Settings
let soundDir = 'assets/';
let initialDelay = 0.5;
let digitDelay = 0; // -0.13 to 0.6  default 0
let pauseDelay = 0.4; //  0.15 to 1.2 default 0.4
//let newDigitDelay = digitDelay;
//let newPauseDelay = pauseDelay;

function setup() {
  createCanvas(0, 0);
  console.clear();
  getAudioContext().suspend();

  // header left
  headerLeft = createElement('span', 'NATURAL');
  headerLeft.class('q-header__left');

  // header right
  headerRight = createElement('span', ' NUMBER READER');
  headerRight.class('q-header__right');

  // header
  header = createElement('h1');
  header.class('q-header');
  header.child(headerLeft);
  header.child(headerRight);

  // input label
  label = createElement('label', 'Input any number');
  label.class('q-label');

  // input field
  input = createInput();
  input.class('q-input');

  // input caption
  inputMax = createP('20 DIGITS MAX');
  inputMax.class('q-input-max');

  // slider
  slider = createElement('section');
  slider.class('q-slider');

  // slider header
  sliderHeader = createElement('h3', 'Set speed');
  sliderHeader.class('q-slider__header');
  slider.child(sliderHeader);

  // slider input wrap
  sliderInputWrap = createElement('article');
  sliderInputWrap.class('q-slider__input-wrap');
  slider.child(sliderInputWrap);

  // slider input slower
  sliderSlower = createElement('span', '&#8211;');
  sliderSlower.class('q-slider__controls');
  sliderInputWrap.child(sliderSlower);

  // slider input container
  sliderInputContainer = createElement('article');
  sliderInputContainer.class('q-slider__input-container');
  sliderInputWrap.child(sliderInputContainer);

  // slider input
  sliderInput = createSlider(0, 100, 75, 25);
  sliderInput.input(changeDelays);
  sliderInput.class('q-slider__input');
  sliderInputContainer.child(sliderInput);

  // slider marker 0%
  sliderMarker = createElement('span');
  sliderMarker.class('q-slider__marker q-slider__marker--0');
  sliderInputContainer.child(sliderMarker);

  // slider marker 25%
  sliderMarker = createElement('span');
  sliderMarker.class('q-slider__marker q-slider__marker--25');
  sliderInputContainer.child(sliderMarker);

  // slider marker 50%
  sliderMarker = createElement('span');
  sliderMarker.class('q-slider__marker q-slider__marker--50');
  sliderInputContainer.child(sliderMarker);

  // slider marker 75%
  sliderMarker = createElement('span');
  sliderMarker.class('q-slider__marker q-slider__marker--75');
  sliderInputContainer.child(sliderMarker);

  // slider marker 100%
  sliderMarker = createElement('span');
  sliderMarker.class('q-slider__marker q-slider__marker--100');
  sliderInputContainer.child(sliderMarker);

  // slider input faster
  sliderFaster = createElement('span', '+');
  sliderFaster.class('q-slider__controls');
  sliderInputWrap.child(sliderFaster);

  // buttons
  buttons = createElement('section');
  buttons.class('q-buttons');

  buttonA = createButton('Play Natural');
  buttonA.mousePressed(playNew);
  buttonA.class('q-button');
  buttons.child(buttonA);

  buttonsDivider = createSpan('or');
  buttonsDivider.class('q-buttons__divider');
  buttons.child(buttonsDivider);

  buttonB = createButton('Play Standard');
  buttonB.mousePressed(playOld);
  buttonB.class('q-button q-button--nobg');
  buttons.child(buttonB);
}

function draw() {}

function playNew() {
  requestNewMode = true;
  newNumber();
}

function playOld() {
  requestNewMode = false;
  newNumber();
}

function changeDelays() {
  let v = 100 - sliderInput.value();
  if (v < 50) {
    digitDelay = map(v, 0, 50, -0.13, 0, true);
    pauseDelay = map(v, 0, 50, 0.15, 0.4, true);
  } else {
    digitDelay = map(v, 50, 100, 0, 0.6, true);
    pauseDelay = map(v, 50, 100, 0.4, 1.2, true);
  }
  console.log('---------------');
  console.log(
    'digitDelay = ' +
      nf(digitDelay, 0, 2) +
      ' | pauseDelay = ' +
      nf(pauseDelay, 0, 2)
  );
}

function keyReleased() {
  if (keyCode === ENTER || keyCode === RETURN) {
    newNumber();
  }
}

function newNumber() {
  if (!nowPlaying) {
    nowPlaying = true;

    d = 0;
    p = 0;
    s = 0;
    l = 0;

    loadString = input.value().replace(/[^0-9]/g, '');
    console.log('Received number:  "' + loadString + '"');

    if (inputString != loadString || playNewMode != requestNewMode) {
      inputString = loadString;
      playNewMode = requestNewMode;

      generatePlaybackPattern();
      console.log('Playback pattern: "' + playbackPattern + '"');

      loadAllSounds();
    } else {
      console.log('Pattern unchanged.');
      playSequence();
    }
  }
}

function loadAllSounds() {
  soundFormats('mp3', 'wav');
  sounds = [];
  let j = 0;

  // Implement Length Check
  if (playbackPattern == "") {
    nowPlaying = false;
  } else {
    // load either .mp3, or .wav, depending on browser
    for (let i = 0; i < playbackPattern.length; i += 2) {
      if (playbackPattern.substr(i, 2) != '--') {
        if (playNewMode) {
          sounds[j] = loadSound(
            soundDir + playbackPattern.substr(i, 2) + '.mp3',
            loaded
          );
        } else {
          sounds[j] = loadSound(
            soundDir + 'E' + playbackPattern.substr(i + 1, 1) + '.mp3',
            loaded
          );
        }
        console.log(
          'Loading sound "' +
            soundDir +
            playbackPattern.substr(i, 2) +
            '.mp3" into register ' +
            j
        );
        j++;
      }
    }
  }
}

function loaded() {
  l++;
  console.log('Loaded ' + l + ' / ' + inputString.length + ' samples.');
  if (l == inputString.length) {
    playSequence();
  }
}

function playSequence() {
  userStartAudio();
  outputVolume(1);
  p = 0; // Start from pattern 0
  s = 0; // Start from sound 0
  d = initialDelay;
  playNext();
}

function doNothing() {}

function playNext() {
  if (p < playbackPattern.length) {
    console.log(
      'Current pattern index = ' +
        p +
        ', and reads as "' +
        playbackPattern.substr(p, 2) +
        '"'
    );
    if (playbackPattern.substr(p, 2) == '--') {
      if (playNewMode) {
        console.log('Inserting delay.');
        d = pauseDelay;
        p += 2;
        playNext();
      } else {
        p += 2;
        playNext();
      }
    } else {
      console.log(
        'Playing sample ' + s + ' with delay of ' + nf(d, 0, 2) + ' sec.'
      );
      sounds[s].play(d);
      sounds[s].clearCues();
      sounds[s].onended(doNothing);
      if (digitDelay >= 0) {
        sounds[s].onended(playNext);
      } else {
        sounds[s].addCue(sounds[s].duration() + digitDelay, playNext);
      }
      d = map(digitDelay, 0, 10, 0, 10, true);
      p += 2;
      s++;
    }
  } else {
    nowPlaying = false;
  }
}

function generatePlaybackPattern() {
  let x = inputString.length;

  // Implement Length Check
  if (isNaN(x) || x < 1 || x > 20) {
    console.error('QERROR: I see an unacceptable string length of ' + x);
    playbackPattern = "";
  } else {
    switch (x) {
      case 1:
        // "H"
        playbackPattern = 'H' + inputString.charAt(0);
        console.log('I see the length of ' + x);
        break;

      case 2:
        // "EH"
        playbackPattern =
          'E' + inputString.charAt(0) + 'H' + inputString.charAt(1);
        console.log('I see the length of ' + x);
        break;

      case 3:
        // "AGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'G' +
          inputString.charAt(1) +
          'H' +
          inputString.charAt(2);
        console.log('I see the length of ' + x);
        break;

      case 4:
        // "AFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'F' +
          inputString.charAt(1) +
          'G' +
          inputString.charAt(2) +
          'H' +
          inputString.charAt(3);
        console.log('I see the length of ' + x);
        break;

      case 5:
        // "AB-EGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          '--' +
          'E' +
          inputString.charAt(2) +
          'G' +
          inputString.charAt(3) +
          'H' +
          inputString.charAt(4);
        console.log('I see the length of ' + x);
        break;

      case 6:
        // "ACD-EGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'C' +
          inputString.charAt(1) +
          'D' +
          inputString.charAt(2) +
          '--' +
          'E' +
          inputString.charAt(3) +
          'G' +
          inputString.charAt(4) +
          'H' +
          inputString.charAt(5);
        console.log('I see the length of ' + x);
        break;

      case 7:
        // "ACD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'C' +
          inputString.charAt(1) +
          'D' +
          inputString.charAt(2) +
          '--' +
          'E' +
          inputString.charAt(3) +
          'F' +
          inputString.charAt(4) +
          'G' +
          inputString.charAt(5) +
          'H' +
          inputString.charAt(6);
        console.log('I see the length of ' + x);
        break;

      case 8:
        // "ABCD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'E' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'H' +
          inputString.charAt(7);
        console.log('I see the length of ' + x);
        break;

      case 9:
        // "ACD-EFD-EGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'C' +
          inputString.charAt(1) +
          'D' +
          inputString.charAt(2) +
          '--' +
          'E' +
          inputString.charAt(3) +
          'F' +
          inputString.charAt(4) +
          'D' +
          inputString.charAt(5) +
          '--' +
          'E' +
          inputString.charAt(6) +
          'G' +
          inputString.charAt(7) +
          'H' +
          inputString.charAt(8);
        console.log('I see the length of ' + x);
        break;

      case 10:
        // "ACD-EFD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'C' +
          inputString.charAt(1) +
          'D' +
          inputString.charAt(2) +
          '--' +
          'E' +
          inputString.charAt(3) +
          'F' +
          inputString.charAt(4) +
          'D' +
          inputString.charAt(5) +
          '--' +
          'E' +
          inputString.charAt(6) +
          'F' +
          inputString.charAt(7) +
          'G' +
          inputString.charAt(8) +
          'H' +
          inputString.charAt(9);
        console.log('I see the length of ' + x);
        break;

      case 11:
        // "ABCD-AFCD-FGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'C' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'F' +
          inputString.charAt(8) +
          'G' +
          inputString.charAt(9) +
          'H' +
          inputString.charAt(10);
        console.log('I see the length of ' + x);
        break;

      case 12:
        // "ABCD-AFCD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'C' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'E' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'H' +
          inputString.charAt(11);
        console.log('I see the length of ' + x);
        break;

      case 13:
        // "ABCD-AFCD-AD-EGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'C' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'D' +
          inputString.charAt(9) +
          '--' +
          'E' +
          inputString.charAt(10) +
          'G' +
          inputString.charAt(11) +
          'H' +
          inputString.charAt(12);
        console.log('I see the length of ' + x);
        break;

      case 14:
        // "ABCD-AFCD-ACD-FGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'C' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'C' +
          inputString.charAt(9) +
          'D' +
          inputString.charAt(10) +
          '--' +
          'F' +
          inputString.charAt(11) +
          'G' +
          inputString.charAt(12) +
          'H' +
          inputString.charAt(13);
        console.log('I see the length of ' + x);
        break;

      case 15:
        // "ABCD-AFCD-AFGD-FGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'F' +
          inputString.charAt(5) +
          'C' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'F' +
          inputString.charAt(12) +
          'G' +
          inputString.charAt(13) +
          'H' +
          inputString.charAt(14);
        console.log('I see the length of ' + x);
        break;

      case 16:
        // "ABCD-ABGD-AFGD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'B' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'E' +
          inputString.charAt(12) +
          'F' +
          inputString.charAt(13) +
          'G' +
          inputString.charAt(14) +
          'H' +
          inputString.charAt(15);
        console.log('I see the length of ' + x);
        break;

      case 17:
        // "ABCD-ABGD-AFGD-AD-EGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'B' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'A' +
          inputString.charAt(12) +
          'D' +
          inputString.charAt(13) +
          '--' +
          'E' +
          inputString.charAt(14) +
          'G' +
          inputString.charAt(15) +
          'H' +
          inputString.charAt(16);
        console.log('I see the length of ' + x);
        break;

      case 18:
        // "ABCD-ABGD-AFGD-EGD-FGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'B' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'E' +
          inputString.charAt(12) +
          'G' +
          inputString.charAt(13) +
          'D' +
          inputString.charAt(14) +
          '--' +
          'F' +
          inputString.charAt(15) +
          'G' +
          inputString.charAt(16) +
          'H' +
          inputString.charAt(17);
        console.log('I see the length of ' + x);
        break;

      case 19:
        // "ABCD-ABGD-AFGD-EBGD-FGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'B' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'E' +
          inputString.charAt(12) +
          'B' +
          inputString.charAt(13) +
          'G' +
          inputString.charAt(14) +
          'D' +
          inputString.charAt(15) +
          '--' +
          'F' +
          inputString.charAt(16) +
          'G' +
          inputString.charAt(17) +
          'H' +
          inputString.charAt(18);
        console.log('I see the length of ' + x);
        break;

      case 20:
        // "ABCD-ABGD-AFGD-EBGD-EFGH"
        playbackPattern =
          'A' +
          inputString.charAt(0) +
          'B' +
          inputString.charAt(1) +
          'C' +
          inputString.charAt(2) +
          'D' +
          inputString.charAt(3) +
          '--' +
          'A' +
          inputString.charAt(4) +
          'B' +
          inputString.charAt(5) +
          'G' +
          inputString.charAt(6) +
          'D' +
          inputString.charAt(7) +
          '--' +
          'A' +
          inputString.charAt(8) +
          'F' +
          inputString.charAt(9) +
          'G' +
          inputString.charAt(10) +
          'D' +
          inputString.charAt(11) +
          '--' +
          'E' +
          inputString.charAt(12) +
          'B' +
          inputString.charAt(13) +
          'G' +
          inputString.charAt(14) +
          'D' +
          inputString.charAt(15) +
          '--' +
          'E' +
          inputString.charAt(16) +
          'F' +
          inputString.charAt(17) +
          'G' +
          inputString.charAt(18) +
          'H' +
          inputString.charAt(19);
        console.log('I see the length of ' + x);
        break;

      default:
        console.error('QERROR: Pattern not implemented for length of ' + x);
    }
  }
}
