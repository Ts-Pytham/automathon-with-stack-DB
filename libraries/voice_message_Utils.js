function speakResult(isValidateWord) {
    const text = isValidateWord ? "palabra válida" : "palabra rechazada";
    const utterance = createUtterance(text);
    speak(utterance);
  }
  
function createUtterance(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    setUtteranceOptions(utterance);
    return utterance;
  }
  
function setUtteranceOptions(utterance) {
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
  }
  
function speak(utterance) {
    const synth = window.speechSynthesis;
    synth.speak(utterance);
  }