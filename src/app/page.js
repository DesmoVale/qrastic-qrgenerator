"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import domtoimage from 'dom-to-image-more';
import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaLinkedin,
  FaDownload,
  FaLink,
  FaImage,
  FaFilePdf,
} from "react-icons/fa";
import { HiColorSwatch } from "react-icons/hi";

const socialBaseUrls = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://www.tiktok.com/@",
  linkedin: "https://www.linkedin.com/in/",
};

const socialIcons = {
  instagram: <FaInstagram size={22} className="text-purple-700" />,
  facebook: <FaFacebookF size={22} className="text-blue-700" />,
  tiktok: <FaTiktok size={22} className="text-gray-800" />,
  linkedin: <FaLinkedin size={22} className="text-blue-800" />,
};

const typeIcons = {
  link: <FaLink size={20} />,
  social: <FaInstagram size={20} />,
  image: <FaImage size={20} />,
  pdf: <FaFilePdf size={20} />,
};

// Predefined color themes
const colorThemes = [
  { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { name: "Neon Blue", fg: "#0066FF", bg: "#F0F7FF" },
  { name: "Forest", fg: "#2E7D32", bg: "#F1F8E9" },
  { name: "Sunset", fg: "#FF5722", bg: "#FBE9E7" },
  { name: "Royal Purple", fg: "#6A1B9A", bg: "#F3E5F5" },
  { name: "Dark Mode", fg: "#FFFFFF", bg: "#121212" },
];

// Default placeholder QR code data
const DEFAULT_QR_DATA = "https://example.com";

// Definizione dimensione di esportazione (maggiore per alta risoluzione)
const EXPORT_SIZE = 1024;
const DISPLAY_SIZE = 280;

export default function Home() {
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  const [type, setType] = useState("link");
  const [value, setValue] = useState("");
  const [username, setUsername] = useState("");
  const [fgColor, setFgColor] = useState("#4338CA"); // Indigo 700 as default
  const [bgColor, setBgColor] = useState("#F5F7FF");
  const [dotStyle, setDotStyle] = useState("dots");
  const [eyeStyle, setEyeStyle] = useState("square");
  const [selectedSocial, setSelectedSocial] = useState("instagram");
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  // Responsiveness
  const [showColorThemes, setShowColorThemes] = useState(true);
  const [showStyleOptions, setShowStyleOptions] = useState(true);

  // On mobile, initialize with collapsed sections
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        setShowColorThemes(false);
        setShowStyleOptions(false);
      } else {
        setShowColorThemes(true);
        setShowStyleOptions(true);
      }
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getQRData = () => {
    if (type === "social") {
      return username
        ? socialBaseUrls[selectedSocial] + username
        : DEFAULT_QR_DATA;
    }
    return value || DEFAULT_QR_DATA;
  };

  // Validate input
  useEffect(() => {
    if (type === "social") {
      setIsValid(username.trim().length > 0);
    } else {
      // Simple validation for URLs
      if (type === "link" || type === "image" || type === "pdf") {
        const urlPattern =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/;
        setIsValid(value && urlPattern.test(value));
      } else {
        setIsValid(value.trim().length > 0);
      }
    }
  }, [value, username, type]);

  // Initialize QR code
  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: DISPLAY_SIZE,
      height: DISPLAY_SIZE,
      type: "svg", // Cambiato da canvas a svg per supporto vettoriale
      data: DEFAULT_QR_DATA, // Show default QR code on load
      image: "",
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        type: eyeStyle,
        color: fgColor,
      },
      cornersDotOptions: {
        type: eyeStyle,
        color: fgColor,
      },
      // Improve dot quality for better definition
      qrOptions: {
        errorCorrectionLevel: 'H', // Highest error correction level
        typeNumber: 0,
        mode: 'Byte',
      }
    });

    qrCode.current.append(qrRef.current);
  }, []);

  // Update QR code on changes
  useEffect(() => {
    const data = getQRData();
    if (qrCode.current) {
      qrCode.current.update({
        data: data,
        dotsOptions: {
          color: fgColor,
          type: dotStyle,
        },
        backgroundOptions: {
          color: bgColor,
        },
        cornersSquareOptions: {
          type: eyeStyle,
          color: fgColor,
        },
        cornersDotOptions: {
          type: eyeStyle,
          color: fgColor,
        },
        qrOptions: {
          errorCorrectionLevel: 'H',
          typeNumber: 0,
          mode: 'Byte',
        }
      });
    }
  }, [
    value,
    username,
    fgColor,
    bgColor,
    dotStyle,
    eyeStyle,
    selectedSocial,
    type,
  ]);


// Funzione per scaricare il QR code come immagine ad alta risoluzione
const downloadQR = () => {
  const node = document.getElementById('qr-container');
  if (!node) return;

  // 1) Clona il nodo per isolare modifiche
  const clone = node.cloneNode(true);
  clone.id = 'qr-export-clone';
  Object.assign(clone.style, {
    position: 'fixed',
    left: '-9999px',
    top: '-9999px',
    margin: '0',
    padding: '0',
    background: bgColor  // mantiene lo sfondo scelto
  });
  // Rimuove pulsanti e messaggi di validazione
  clone.querySelectorAll('button, p.text-orange-600').forEach(el => el.remove());

  // 2) Pulisce tutti i figli da bordi, ombre, padding e margin indesiderati
  const resetStyles = document.createElement('style');
  resetStyles.textContent = `
    #qr-export-clone,
    #qr-export-clone * {
      border: none !important;
      box-shadow: none !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;
      background: transparent !important;
    }
    /* Mantieni solo padding e background del container */
    #qr-export-clone {
      background: ${bgColor} !important;
      padding: 0 !important;  // rimuovi padding extra non necessari
    }
  `;
  clone.prepend(resetStyles);
  document.body.appendChild(clone);

  // 3) Imposta la dimensione finale dell'immagine (es. 1080x1080)
  const exportWidth = 800;  // Impostato per una qualità alta
  const exportHeight = 800; // Impostato per una qualità alta

  // 4) Imposta opzioni di esportazione per alta risoluzione
  const options = {
    width: exportWidth,
    height: exportHeight,
    style: {
      'background-color': bgColor,
      'padding': '0px'  // Rimuove padding aggiuntivo
    },
    pixelRatio: 20, // Aumentato per risoluzione molto alta
    cacheBust: true  // Forza il reload delle immagini esterne
  };

  // 5) Genera il PNG e avvia il download
  domtoimage.toPng(clone, options)
    .then(dataUrl => {
      const link = document.createElement('a');
      const fileName = (type === "social")
        ? `qrastic-${selectedSocial}-${username}`
        : 'qrastic-code';
      link.download = `${fileName}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    })
    .catch(err => {
      console.error('Errore generazione immagine:', err);
      alert("Errore durante la generazione dell'immagine. Riprova.");
    })
    .finally(() => {
      // 6) Pulizia: rimuove il clone isolato dal DOM
      document.body.removeChild(clone);
    });
};

// ------ //




  const applyColorTheme = (theme) => {
    setFgColor(theme.fg);
    setBgColor(theme.bg);
  };

  const renderInputField = () => {
    switch (type) {
      case "social":
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Social:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(socialBaseUrls).map((social) => (
                  <button
                    key={social}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                      selectedSocial === social
                        ? "bg-indigo-100 ring-1 ring-indigo-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => setSelectedSocial(social)}
                  >
                    {socialIcons[social]}
                    <span
                      className={`text-xs mt-1 capitalize font-medium ${selectedSocial === social ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {social}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Username:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600 text-base font-medium">
                  @
                </span>
                <input
                  type="text"
                  className="w-full pl-7 p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-800"
                  placeholder="mario.rossi"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1.5">
              {type === "link"
                ? "URL:"
                : type === "image"
                  ? "Immagine URL:"
                  : type === "pdf"
                    ? "PDF URL:"
                    : "Valore:"}
            </label>
            <input
              type="text"
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-800"
              placeholder={
                type === "link"
                  ? "https://example.com"
                  : type === "image"
                    ? "https://example.com/image.jpg"
                    : type === "pdf"
                      ? "https://example.com/document.pdf"
                      : ""
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen p-2 md:p-6 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        {/* Header section with Century Gothic font */}
        <div className="text-center mb-3 md:mb-5">
          <h1 className="century-gothic text-3xl md:text-6xl font-bold mb-1 md:mb-3 text-indigo-600 tracking-wide px-2 py-1">
            QRastic!
          </h1>

          <div className="flex justify-center items-center gap-2 text-xs md:text-base text-gray-700">
            <p className="hidden md:block">
              Crea codici QR personalizzati per link, social media, immagini e
              documenti completamente gratuiti!
            </p>
            <p className="md:hidden">Crea QR code personalizzati gratis!</p>

            {!showInfo && (
              <button
                onClick={() => setShowInfo(true)}
                className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-100 text-indigo-800 hover:bg-indigo-200 font-bold text-xs"
                aria-label="Mostra informazioni"
              >
                i
              </button>
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="px-2 md:p-4">
          {showInfo && (
            <div className="relative bg-indigo-800 text-white p-3 md:p-5 rounded-xl shadow-md mb-4 md:mb-6 max-w-4xl mx-auto">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 text-indigo-200 hover:text-white text-2xl"
                aria-label="Chiudi"
              >
                ×
              </button>

              <h2 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                QR Code di Qualità, Davvero Gratuiti
              </h2>
              <p className="text-xs md:text-sm mb-2 text-indigo-100">
                Nessun costo nascosto, nessuna registrazione richiesta. Crea QR
                code unici con i tuoi colori e stili preferiti.
              </p>

              <div className="grid grid-cols-3 gap-2 mt-2">
                <div className="flex flex-col items-center text-center bg-indigo-700/50 p-2 rounded-lg">
                  <span className="text-base md:text-lg mb-1">✨</span>
                  <h3 className="font-bold text-xs">Gratuito</h3>
                </div>
                <div className="flex flex-col items-center text-center bg-indigo-700/50 p-2 rounded-lg">
                  <span className="text-base md:text-lg mb-1">🎨</span>
                  <h3 className="font-bold text-xs">Personalizzabile</h3>
                </div>
                <div className="flex flex-col items-center text-center bg-indigo-700/50 p-2 rounded-lg">
                  <span className="text-base md:text-lg mb-1">📱</span>
                  <h3 className="font-bold text-xs">Alta Qualità</h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content - Mobile layout as accordion, Desktop as grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-3 md:gap-6">
          {/* Controls section */}
          <div className="bg-white p-3 md:p-6 rounded-xl shadow-md space-y-3 md:space-y-4 border border-gray-100">
            {/* QR Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Tipo di QR:
              </label>
              <div className="grid grid-cols-4 gap-1 md:gap-2">
                {Object.entries(typeIcons).map(([key, icon]) => (
                  <button
                    key={key}
                    className={`p-2 rounded-lg flex flex-col items-center justify-center transition-all ${
                      type === key
                        ? "bg-indigo-100 ring-1 ring-indigo-600 shadow-sm"
                        : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => {
                      setType(key);
                      setValue("");
                      setUsername("");
                    }}
                  >
                    <div
                      className={`text-sm md:text-base ${type === key ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {icon}
                    </div>
                    <span
                      className={`text-xs mt-1 capitalize font-medium ${type === key ? "text-indigo-700" : "text-gray-700"}`}
                    >
                      {key}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Input fields */}
            {renderInputField()}

            {/* Color Theme Accordion */}
            <div className="border-t border-gray-200 pt-3">
              <button
                className="flex items-center justify-between w-full text-left font-medium text-gray-800 mb-2"
                onClick={() => setShowColorThemes(!showColorThemes)}
              >
                <div className="flex items-center text-base md:text-lg">
                  <HiColorSwatch className="mr-2 text-indigo-600" /> Tema Colori
                </div>
                <span>{showColorThemes ? "▲" : "▼"}</span>
              </button>

              {showColorThemes && (
                <>
                  <div className="grid grid-cols-3 gap-1 md:gap-2 mb-3">
                    {colorThemes.slice(0, 6).map((theme, index) => (
                      <button
                        key={index}
                        className="p-1.5 md:p-2 rounded-lg border border-gray-200 hover:border-indigo-400 hover:shadow-sm transition-all flex items-center"
                        onClick={() => applyColorTheme(theme)}
                      >
                        <div
                          className="w-4 h-4 md:w-6 md:h-6 rounded-full mr-1 md:mr-2 shadow-sm"
                          style={{
                            backgroundColor: theme.fg,
                            border: `2px solid ${theme.bg}`,
                          }}
                        />
                        <span className="text-xs font-medium text-gray-700 truncate">
                          {theme.name}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="mt-2">
                    <button
                      className="text-indigo-700 font-medium flex items-center text-sm md:text-base hover:text-indigo-800 transition-colors"
                      onClick={() => setShowCustomColors(!showCustomColors)}
                    >
                      {showCustomColors
                        ? "↑ Nascondi colori"
                        : "✨ Personalizza colori"}
                    </button>

                    {showCustomColors && (
                      <div className="grid grid-cols-2 gap-2 mt-2 bg-indigo-50 p-2 rounded-lg">
                        <div>
                          <label className="block text-xs font-medium text-gray-800 mb-1">
                            Colore QR:
                          </label>
                          <input
                            type="color"
                            className="w-full h-8 md:h-10 p-1 rounded-lg border shadow-sm"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-800 mb-1">
                            Colore Sfondo:
                          </label>
                          <input
                            type="color"
                            className="w-full h-8 md:h-10 p-1 rounded-lg border shadow-sm"
                            value={bgColor}
                            onChange={(e) => setBgColor(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Style Options Accordion */}
            <div className="border-t border-gray-200 pt-3">
              <button
                className="flex items-center justify-between w-full text-left font-medium text-gray-800 mb-2"
                onClick={() => setShowStyleOptions(!showStyleOptions)}
              >
                <div className="flex items-center text-base md:text-lg">
                  <span className="mr-2">🎨</span> Opzioni di Stile
                </div>
                <span>{showStyleOptions ? "▲" : "▼"}</span>
              </button>

              {showStyleOptions && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">
                      Stile Punti:
                    </label>
                    <select
                      className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-800 text-sm"
                      value={dotStyle}
                      onChange={(e) => setDotStyle(e.target.value)}
                    >
                      <option value="dots">Dots</option>
                      <option value="rounded">Rounded</option>
                      <option value="classy">Classy</option>
                      <option value="classy-rounded">Classy Rounded</option>
                      <option value="square">Square</option>
                      <option value="extra-rounded">Extra Rounded</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-800 mb-1">
                      Stile Angoli:
                    </label>
                    <select
                      className="w-full p-1.5 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-white shadow-sm text-gray-800 text-sm"
                      value={eyeStyle}
                      onChange={(e) => setEyeStyle(e.target.value)}
                    >
                      <option value="square">Square</option>
                      <option value="dot">Dot</option>
                      <option value="extra-rounded">Extra Rounded</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Preview and Download section */}
          <div className="bg-white p-3 md:p-6 rounded-xl shadow-md flex flex-col items-center justify-center border border-gray-100">
            <div
              id="qr-container"
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              <div
                className={`transition-opacity duration-300 ${isValid ? "opacity-100" : "opacity-40"}`}
              >
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 md:p-5 rounded-xl shadow-inner">
                  <div
                    ref={qrRef}
                    className="border-2 border-white rounded-lg p-2 md:p-3 shadow-md"
                  />
                </div>
              </div>

              {type === "social" && username && (
                <div className="mt-2 mb-1 text-center flex items-center justify-center space-x-2 bg-indigo-50 px-4 py-1.5 rounded-full">
                  {socialIcons[selectedSocial]}
                  <span className="font-medium text-gray-800 text-sm md:text-base">
                    @{username}
                  </span>
                </div>
              )}
              <p className="text-gray-500 text-xs mt-1 font-sans">
                Codice QR generato con QRastic!
              </p>
            </div>

            <div className="w-full mt-3 md:mt-4">
              <button
                onClick={downloadQR}
                disabled={!isValid}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg shadow-md text-white font-medium text-base md:text-lg transition-all ${
                  isValid
                    ? "bg-indigo-700 hover:bg-indigo-800 hover:shadow-lg"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <FaDownload size={18} />
                Scarica QR Code SVG
              </button>

              {!isValid && (
                <p className="text-orange-600 text-xs mt-1.5 text-center font-medium">
                  {type === "social"
                    ? "Inserisci un username per generare il QR code"
                    : "Inserisci un URL valido per generare il QR code"}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}