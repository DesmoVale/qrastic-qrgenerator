"use client";

import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import html2canvas from "html2canvas";
import ReactDOMServer from "react-dom/server";

import jsPDF from "jspdf";
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
const DISPLAY_SIZE = 280;

export default function Home() {
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  const [type, setType] = useState("link");
  const [value, setValue] = useState("");
  const [username, setUsername] = useState("");
  const [fgColor, setFgColor] = useState("black"); // Indigo 700 as default
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
        errorCorrectionLevel: "H", // Highest error correction level
        typeNumber: 0,
        mode: "Byte",
      },
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
          errorCorrectionLevel: "H",
          typeNumber: 0,
          mode: "Byte",
        },
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
  const downloadQR = async () => {
    try {
      const svgElement = qrRef.current.querySelector("svg");
      if (!svgElement) {
        console.error("SVG element not found");
        return;
      }
  
      // Determina la scala appropriata basata sul dispositivo, con valori migliorati per la qualità
      // Usiamo 2 per iOS e 1.5 per altri dispositivi per una migliore qualità
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const pixelRatio = Math.min(isIOS ? 2 : 1.5, window.devicePixelRatio || 1.5);
      
      // Dimensioni leggermente aumentate per migliorare la qualità
      const canvasWidth = 750; // Aumentato da 600
      const canvasHeight = 900; // Aumentato da 750
      
      // Canvas ottimizzato
      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth * pixelRatio;
      canvas.height = canvasHeight * pixelRatio;
      canvas.style.width = canvasWidth + "px";
      canvas.style.height = canvasHeight + "px";
      
      const ctx = canvas.getContext("2d");
      ctx.scale(pixelRatio, pixelRatio);
  
      // Sfondo
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  
      // Preparazione SVG ottimizzata con dimensioni migliorate
      const svgClone = svgElement.cloneNode(true);
      // Aumentiamo la dimensione SVG per una nitidezza ottimale
      svgClone.setAttribute("width", "650"); // Aumentato da 500
      svgClone.setAttribute("height", "650"); // Aumentato da 500
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      
      // Rimuovi eventuali attributi di stile che potrebbero interferire
      Array.from(svgClone.querySelectorAll("*")).forEach(el => {
        if (el.hasAttribute("style")) {
          // Mantieni solo gli stili essenziali
          const style = el.getAttribute("style");
          el.setAttribute("style", style.replace(/opacity:[\d.]+;?/g, ""));
        }
      });
      
      const svgData = new XMLSerializer().serializeToString(svgClone);
      
      // Calcola dimensione QR code migliorata
      const qrSize = 550; // Aumentato da 450 per maggiore nitidezza
      const qrX = (canvasWidth - qrSize) / 2;
      const qrY = 75; // Ridotto da 150
      
      // Usa direttamente l'SVG come immagine sorgente per il canvas
      await new Promise((resolve) => {
        const img = new Image();
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
        
        img.onload = () => {
          // Diamo priorità alla nitidezza usando crisp rendering
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
          ctx.imageSmoothingEnabled = true; // Riabilita per il resto del contenuto
          resolve();
        };
      });
  
      // Gestione dell'icona social e username con dimensioni ridotte
      if (type === "social" && username) {
        const tagY = canvasHeight * 0.8; // Proporzionale all'altezza del canvas
        const iconSize = 60; // Aumentato da 50 per maggiore visibilità
  
        // Seleziona componente icona
        const IconComponent = {
          instagram: FaInstagram,
          facebook: FaFacebookF,
          linkedin: FaLinkedin,
          tiktok: FaTiktok,
        }[selectedSocial];
  
        if (!IconComponent) {
          console.warn("Icona non trovata per:", selectedSocial);
          return;
        }
  
        // Renderizza l'icona React con dimensioni ottimizzate
        const iconMarkup = ReactDOMServer.renderToStaticMarkup(
          <div style={{ fontSize: `${iconSize}px`, color: fgColor }}>
            <IconComponent />
          </div>,
        );
  
        // Container temporaneo
        const tempDiv = document.createElement("div");
        tempDiv.style.position = "fixed";
        tempDiv.style.top = "-1000px";
        tempDiv.style.left = "-1000px";
        tempDiv.style.width = "50px"; // Ridotto da 100px
        tempDiv.style.height = "50px"; // Ridotto da 100px
        tempDiv.style.display = "flex";
        tempDiv.style.alignItems = "center";
        tempDiv.style.justifyContent = "center";
        tempDiv.style.background = "transparent";
        tempDiv.style.color = fgColor;
        tempDiv.innerHTML = iconMarkup;
        document.body.appendChild(tempDiv);
  
        try {
          const iconCanvas = await html2canvas(tempDiv, {
            backgroundColor: null,
            scale: 3, // Aumentato da 2 per icone più nitide
            useCORS: true,
          });
  
          const iconImage = new Image();
          iconImage.src = iconCanvas.toDataURL("image/png", 1.0); // Qualità massima per l'icona
  
          await new Promise((res) => {
            iconImage.onload = () => {
              ctx.font = `bold ${40}px sans-serif`; // Aumentato da 34px per maggiore leggibilità
              ctx.fillStyle = fgColor;
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
  
              const text = `@${username}`;
              const textWidth = ctx.measureText(text).width;
              const spacing = 10; // Ridotto da 20
              const totalWidth = iconSize + spacing + textWidth;
  
              const iconX = (canvasWidth - totalWidth) / 2;
              const iconY = tagY - iconSize / 2;
              ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
  
              // Testo accanto all'icona
              ctx.fillText(text, iconX + iconSize + spacing, tagY);
              res();
            };
          });
        } finally {
          document.body.removeChild(tempDiv);
        }
      }
  
      // Footer QRastic! con dimensione migliorata
      ctx.font = "24px sans-serif"; // Aumentato da 20px per maggiore leggibilità
      ctx.fillStyle = "#888888";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("QRcode made with QRastic!", canvasWidth / 2, canvasHeight - 15); // Posizione adattata
  
      // Usa qualità JPEG migliorata per un risultato finale migliore
      const pngDataUrl = canvas.toDataURL("image/jpeg", 0.92); // Aumentata da 0.85 per maggiore qualità
  
      // Configurazione del PDF ottimizzata
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [100, 125],
        compress: true, // Abilita la compressione
      });
  
      const pdfWidth = 90;
      const pdfHeight = 115;
      const marginX = (100 - pdfWidth) / 2;
      const marginY = (125 - pdfHeight) / 2;
  
      // Aggiungi l'immagine ottimizzata
      pdf.addImage(pngDataUrl, "JPEG", marginX, marginY, pdfWidth, pdfHeight, null, 'FAST');
      pdf.save("qrastic-social.pdf");
    } catch (err) {
      console.error("Errore durante l'esportazione:", err);
      alert("Si è verificato un errore durante la creazione del PDF.");
    }
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
    <div className="min-h-screen p-4 md:p-8 bg-white">
      <div className="max-w-5xl mx-auto">
        {/* Header section with clean typography */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-2 text-gray-900 tracking-tight px-3 py-2">
            QRastic!
          </h1>

          <div className="flex justify-center items-center gap-3 text-xs md:text-sm text-gray-600">
            <p className="hidden md:block">
              Crea codici QR personalizzati per link, social media, immagini e
              documenti completamente gratuiti!
            </p>
            <p className="md:hidden">Crea QR code personalizzati gratis!</p>

            {!showInfo && (
              <button
                onClick={() => setShowInfo(true)}
                className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200 font-semibold text-sm transition-all"
                aria-label="Mostra informazioni"
              >
                i
              </button>
            )}
          </div>
        </div>

        {/* Info section */}
        <div className="px-4 md:px-6">
          {showInfo && (
            <div className="relative bg-gray-100 text-gray-900 p-4 md:p-6 rounded-lg shadow-sm mb-6 max-w-4xl mx-auto">
              <button
                onClick={() => setShowInfo(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl"
                aria-label="Chiudi"
              >
                ×
              </button>

              <h2 className="text-xl md:text-2xl font-semibold mb-2">
                QR Code di Qualità, Davvero Gratuiti
              </h2>
              <p className="text-sm mb-3 text-gray-700">
                Nessun costo nascosto, nessuna registrazione richiesta. Crea QR
                code unici con i tuoi colori e stili preferiti.
              </p>

              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="flex flex-col items-center text-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-lg md:text-xl mb-2">✨</span>
                  <h3 className="font-medium text-sm">Gratuito</h3>
                </div>
                <div className="flex flex-col items-center text-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-lg md:text-xl mb-2">🎨</span>
                  <h3 className="font-medium text-sm">Personalizzabile</h3>
                </div>
                <div className="flex flex-col items-center text-center bg-white p-3 rounded-lg shadow-sm">
                  <span className="text-lg md:text-xl mb-2">📱</span>
                  <h3 className="font-medium text-sm">Alta Qualità</h3>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content - Mobile layout as accordion, Desktop as grid */}
        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-8">
          {/* Controls section */}
          <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-sm space-y-4">
            {/* QR Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo di QR:
              </label>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(typeIcons).map(([key, icon]) => (
                  <button
                    key={key}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all ${
                      type === key
                        ? "bg-blue-50 ring-1 ring-blue-500 shadow-sm"
                        : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-blue-300"
                    }`}
                    onClick={() => {
                      setType(key);
                      setValue("");
                      setUsername("");
                    }}
                  >
                    <div
                      className={`text-lg md:text-xl ${type === key ? "text-blue-600" : "text-gray-700"}`}
                    >
                      {icon}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${type === key ? "text-blue-600" : "text-gray-700"}`}
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
            <div className="border-t border-gray-200 pt-4">
              <button
                className="flex items-center justify-between w-full text-left font-medium text-gray-800 mb-3"
                onClick={() => setShowColorThemes(!showColorThemes)}
              >
                <div className="flex items-center text-lg">
                  <HiColorSwatch className="mr-3 text-blue-500" /> Tema Colori
                </div>
                <span>{showColorThemes ? "▲" : "▼"}</span>
              </button>

              {showColorThemes && (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {colorThemes.slice(0, 6).map((theme, index) => (
                      <button
                        key={index}
                        className="p-2 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all flex items-center"
                        onClick={() => applyColorTheme(theme)}
                      >
                        <div
                          className="w-6 h-6 rounded-full mr-2 shadow-sm"
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

                  <div className="mt-3">
                    <button
                      className="text-blue-600 font-medium flex items-center text-sm md:text-base hover:text-blue-700 transition-colors"
                      onClick={() => setShowCustomColors(!showCustomColors)}
                    >
                      {showCustomColors
                        ? "↑ Nascondi colori"
                        : "✨ Personalizza colori"}
                    </button>

                    {showCustomColors && (
                      <div className="grid grid-cols-2 gap-4 mt-3 bg-white p-3 rounded-lg shadow-sm">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Colore QR:
                          </label>
                          <input
                            type="color"
                            className="w-full h-10 p-2 rounded-lg border shadow-sm"
                            value={fgColor}
                            onChange={(e) => setFgColor(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Colore Sfondo:
                          </label>
                          <input
                            type="color"
                            className="w-full h-10 p-2 rounded-lg border shadow-sm"
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
            <div className="border-t border-gray-200 pt-4">
              <button
                className="flex items-center justify-between w-full text-left font-medium text-gray-800 mb-3"
                onClick={() => setShowStyleOptions(!showStyleOptions)}
              >
                <div className="flex items-center text-lg">
                  <span className="mr-3">🎨</span> Opzioni di Stile
                </div>
                <span>{showStyleOptions ? "▲" : "▼"}</span>
              </button>

              {showStyleOptions && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stile Punti:
                    </label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm text-gray-800"
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
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stile Angoli:
                    </label>
                    <select
                      className="w-full p-2 border border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm text-sm text-gray-800"
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
          <div className="bg-gray-50 p-4 md:p-8 rounded-lg shadow-sm flex flex-col items-center justify-center">
            <div
              id="qr-container"
              className="flex-1 flex flex-col items-center justify-center w-full"
            >
              <div
                className={`transition-opacity duration-300 ${isValid ? "opacity-100" : "opacity-40"}`}
              >
                <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm">
                  <div
                    ref={qrRef}
                    className="border border-gray-100 rounded-lg p-3 md:p-4 shadow-sm"
                  />
                </div>
              </div>

              {type === "social" && username && (
                <div className="mt-3 mb-2 text-center flex items-center justify-center space-x-3 bg-gray-100 px-6 py-2 rounded-full">
                  {socialIcons[selectedSocial]}
                  <span className="font-medium text-gray-800 text-sm md:text-lg">
                    @{username}
                  </span>
                </div>
              )}
              <p className="text-gray-400 text-xs mt-1 font-sans">
                Codice QR generato con QRastic
              </p>
            </div>

            <div className="w-full mt-4">
              <button
                onClick={downloadQR}
                disabled={!isValid}
                className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-lg shadow-sm text-white font-medium text-lg transition-all ${
                  isValid
                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                <FaDownload size={20} />
                Scarica QR Code PDF
              </button>

              {!isValid && (
                <p className="text-red-500 text-xs mt-2 text-center font-medium">
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
