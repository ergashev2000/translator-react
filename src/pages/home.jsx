import "babel-polyfill";
import { useState, useRef } from "react";

import { countriesData } from "../utils/countriesData";

import axios from "axios";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { BiMicrophone } from "react-icons/bi";
import { BsStopCircle } from "react-icons/bs";

import "../style.css";

export default function home() {
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const fromSelect = useRef(null);
  const toSelect = useRef(null);

  const exChangeTextAndLanguages = () => {
    if (toText || (!fromText && !toText)) {
      const textCopy = [...fromText].join("");
      setFromText(toText);
      setToText(textCopy);

      const selectCopy = [...fromSelect.current.value].join("");
      fromSelect.current.value = toSelect.current.value;
      toSelect.current.value = selectCopy;
    }
  };

  const translateText = () => {
    if (fromText) {
      const apiUrl = `https://api.mymemory.translated.net/get?q=${fromText}&langpair=${fromSelect.current.value}|${toSelect.current.value}`;
      axios
        .get(apiUrl)
        .then(({ data }) => {
          setToText(data.responseData.translatedText);
        })
        .catch(err => console.error(err));
    } else setToText("");
  };

  const speak = ({ target }) => {
    let utterance;
    if (target.id == "from" && fromText) {
      utterance = new SpeechSynthesisUtterance(fromText);
      utterance.lang = fromSelect.current.value;
    } else {
      utterance = new SpeechSynthesisUtterance(toText);
      utterance.lang = toSelect.current.value;
    }
    speechSynthesis.speak(utterance);
  };

  const { transcript, listening } = useSpeechRecognition();
  let tx = "";
  if (listening) {
    tx = transcript.trim();
    setTimeout(() => {
      setFromText(tx.trim());
    }, 1000);
  }

  return (
    <div className="container" style={{ margin: "0 auto" }}>
      <div className="headContainer">
        <h1>Translator</h1>
      </div>
      <div className="wrapper">
        <div className="text-input">
          <div className="microphone">
            {!listening ? (
              <BiMicrophone onClick={SpeechRecognition.startListening} />
            ) : (
              <>
                <BsStopCircle onClick={SpeechRecognition.stopListening} />
              </>
            )}
          </div>
          <textarea
            value={fromText}
            onChange={({ target }) => setFromText(target.value)}
            onKeyUp={() => {
              if (!fromText) setToText("");
            }}
            name="fromText"
            className="from-text"
            placeholder="Enter text"
          />
          <textarea
            value={toText}
            onChange={({ target }) => setToText(target.value)}
            readOnly
            className="to-text"
            placeholder="Translation"
            name="toText"
          />
        </div>
        <ul className="controls">
          <li className="row from">
            <div className="icons" onClick={speak}>
              <i id="from" className="fas fa-volume-up"></i>
            </div>
            <select ref={fromSelect} defaultValue={"en-GB"}>
              {countriesData.map((v, i) => (
                <option key={v.countryCode + i} value={v.countryCode}>
                  {v.country}
                </option>
              ))}
            </select>
          </li>
          <li className="exchange" onClick={exChangeTextAndLanguages}>
            <i className="fas fa-exchange-alt"></i>
          </li>
          <li className="row to">
            <select ref={toSelect} defaultValue={"uz-UZ"}>
              {countriesData.map((v, i) => (
                <option key={v.countryCode + i} value={v.countryCode}>
                  {v.country}
                </option>
              ))}
            </select>
            <div className="icons" onClick={speak}>
              <i id="to" className="fas fa-volume-up"></i>
            </div>
          </li>
        </ul>
      </div>
      <button onClick={translateText}>Translate Text</button>
    </div>
  );
}
