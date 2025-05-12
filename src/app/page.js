"use client";

import React, { useEffect, useRef, useState, useCallback } from "react"; // Aggiunto useCallback
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
  FaBars,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaHeart,
  FaBalanceScale,
  FaCookieBite,
} from "react-icons/fa";
import { HiColorSwatch } from "react-icons/hi";

// 1. Temi Colore Iniziali (integrati)
const initialColorThemes = [
  { name: "Classic", fg: "#000000", bg: "#FFFFFF" },
  { name: "Neon Blue", fg: "#0066FF", bg: "#F0F7FF" },
  { name: "Forest", fg: "#2E7D32", bg: "#F1F8E9" },
  { name: "Sunset", fg: "#FF5722", bg: "#FBE9E7" },
  { name: "Royal Purple", fg: "#6A1B9A", bg: "#F3E5F5" },
  { name: "Dark Mode", fg: "#FFFFFF", bg: "#121212" }, // Era 'Inverted'
  { name: "Charcoal", fg: "#E0E0E0", bg: "#262626" },
  { name: "Silver", fg: "#1E1E1E", bg: "#E0E0E0" },
];

const socialBaseUrls = {
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  tiktok: "https://www.tiktok.com/@",
  linkedin: "https://www.linkedin.com/in/",
};

const socialIcons = {
  instagram: <FaInstagram size={22} className="text-pink-500" />,
  facebook: <FaFacebookF size={22} className="text-blue-600" />,
  tiktok: <FaTiktok size={22} className="text-black" />,
  linkedin: <FaLinkedin size={22} className="text-blue-700" />,
};

// Per l'icona al centro del QR
const getSocialIconSvgDataUrl = async (socialName, color) => {
  let pathD = "";
  let viewBox = "0 0 24 24";

  // Definiamo i path SVG direttamente per ogni icona social
  // Questi path sono estratti direttamente dalle librerie di icone React
  switch (socialName) {
    case "instagram":
      pathD =
        "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z";
      break;
    case "facebook":
      pathD =
        "M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 011.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 00-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 00-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647z";
      viewBox = "0 0 24 24";
      break;
    case "tiktok":
      pathD =
        "M12.53.02C13.84 0 15.14.01 16.44 0c.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z";
      viewBox = "0 0 24 24";
      break;
    case "linkedin":
      pathD =
        "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";
      viewBox = "0 0 24 24";
      break;
    default:
      return null;
  }

  // Crea un SVG pulito con il path dell'icona
  const svgString = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="64" height="64">
      <path fill="${color}" d="${pathD}"></path>
    </svg>
  `;

  // Converti in data URL (con base64 encoding)
  const base64Svg = btoa(svgString);
  // Simuliamo un'operazione asincrona per mantenere la compatibilità con il codice che chiama questa funzione
  return Promise.resolve(`data:image/svg+xml;base64,${base64Svg}`);
};

const typeIcons = {
  link: <FaLink size={20} />,
  social: <FaInstagram size={20} />,
  image: <FaImage size={20} />,
  pdf: <FaFilePdf size={20} />,
};

const DEFAULT_QR_DATA = "https://qractic.com";
const DISPLAY_SIZE = 280; // Dimensione di visualizzazione nella pagina

// Componente Header (invariato)
const Header = ({ siteTitle, onMenuToggle }) => {
  return (
    <header className="bg-black text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <button
          onClick={onMenuToggle}
          className="text-white p-2 focus:outline-none md:hidden"
          aria-label="Apri menu"
        >
          <FaBars size={24} />
        </button>

        <div className="flex items-center text-2xl font-bold tracking-tight flex-grow text-center md:text-left pl-10 md:pl-0">
          <img
            src="/QRastic___2_-removebg-preview.png"
            alt="Logo QRastic"
            width="40"
            height="40"
            className="mr-2"
          />
          {siteTitle}
        </div>

        <nav className="hidden md:flex space-x-6 items-center">
          <a href="#" className="hover:text-gray-300 transition-colors">
            Home
          </a>
          <a href="#about" className="hover:text-gray-300 transition-colors">
            About
          </a>
          <a href="#cookies" className="hover:text-gray-300 transition-colors">
            Cookies
          </a>
          <a href="#support" className="hover:text-gray-300 transition-colors">
            Support Me
          </a>
          <a href="#licenses" className="hover:text-gray-300 transition-colors">
            Licenses
          </a>
        </nav>

        <div className="w-10 md:hidden"></div>
      </div>
    </header>
  );
};
// Componente Menu Laterale
const SidebarMenu = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: "Home", icon: <FaHome className="mr-3" />, href: "#" },
    { name: "About", icon: <FaInfoCircle className="mr-3" />, href: "#about" },
    {
      name: "Support Me",
      icon: <FaHeart className="mr-3" />,
      href: "#support",
    },
    {
      name: "Licenses",
      icon: <FaBalanceScale className="mr-3" />,
      href: "#licenses",
    },
    {
      name: "Cookies",
      icon: <FaCookieBite className="mr-3" />,
      href: "#cookies",
    },
  ];
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-40 md:hidden"
          onClick={onClose}
        ></div>
      )}
      <aside
        className={`fixed top-0 left-0 w-64 bg-black text-white h-full p-5 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-50 shadow-lg md:hidden`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl font-semibold">Menu</h2>
          <button
            onClick={onClose}
            className="text-white p-2"
            aria-label="Chiudi menu"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <nav>
          <ul>
            {menuItems.map((item) => (
              <li key={item.name} className="mb-4">
                <a
                  href={item.href}
                  onClick={onClose}
                  className="flex items-center p-3 hover:bg-gray-700 rounded-md transition-colors text-lg"
                >
                  {item.icon} {item.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default function Home() {
  const qrRef = useRef(null);
  const qrCode = useRef(null);

  const [showLicenses, setShowLicenses] = useState(false);
  const [type, setType] = useState("link");
  const [value, setValue] = useState("");
  const [username, setUsername] = useState("");
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#FFFFFF");
  const [dotStyle, setDotStyle] = useState("square");
  const [eyeStyle, setEyeStyle] = useState("square"); // Per i frame degli angoli
  const [cornerDotStyle, setCornerDotStyle] = useState("dot"); // 4. Per i punti interni agli angoli
  const [selectedSocial, setSelectedSocial] = useState("instagram");
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // 2. Usabilità mobile: sezioni collassate di default su mobile
  const [isMobile, setIsMobile] = useState(false);
  const [showColorThemes, setShowColorThemes] = useState(true);
  const [showStyleOptions, setShowStyleOptions] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [qrImage, setQrImage] = useState(null); // 5. Per l'icona social al centro

  useEffect(() => {
    const checkMobile = () => window.innerWidth < 768;
    const mobileState = checkMobile();
    setIsMobile(mobileState);
    if (mobileState) {
      setShowColorThemes(false);
      setShowStyleOptions(false);
    }

    const handleResize = () => {
      const currentMobileState = checkMobile();
      setIsMobile(currentMobileState);
      if (currentMobileState) {
        // Non ricollassare se l'utente li ha aperti
      } else {
        setIsMenuOpen(false);
        setShowColorThemes(true);
        setShowStyleOptions(true);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getQRData = useCallback(() => {
    if (type === "social") {
      return username
        ? socialBaseUrls[selectedSocial] + username
        : DEFAULT_QR_DATA;
    }
    return value || DEFAULT_QR_DATA;
  }, [type, username, selectedSocial, value]);

  useEffect(() => {
    if (type === "social") {
      setIsValid(username.trim().length > 0);
    } else if (type === "link" || type === "image" || type === "pdf") {
      try {
        new URL(value);
        setIsValid(value.trim().length > 0);
      } catch {
        setIsValid(false);
      }
    } else {
      setIsValid(value.trim().length > 0);
    }
  }, [value, username, type]);

  // 5. Effetto per caricare l'icona social per il QR code
  useEffect(() => {
    if (type === "social" && selectedSocial && isValid) {
      getSocialIconSvgDataUrl(selectedSocial, fgColor).then((dataUrl) => {
        setQrImage(dataUrl);
      });
    } else {
      setQrImage(null);
    }
  }, [type, selectedSocial, fgColor, isValid]);

  useEffect(() => {
    if (qrCode.current && qrRef.current) {
      // Assicurati che qrRef.current esista
      qrCode.current.update({
        data: getQRData(),
        image: qrImage, // 5. Icona al centro
        dotsOptions: { color: fgColor, type: dotStyle },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: eyeStyle, color: fgColor },
        cornersDotOptions: { type: cornerDotStyle, color: fgColor }, // 4. Stile punti angoli
        imageOptions: {
          imageSize: 0.4, // Rapporto rispetto alla dimensione del QR
          margin: 1, // Margine attorno all'immagine (in "moduli" QR)
          hideBackgroundDots: true,
        },
      });
    } else if (qrRef.current) {
      // Inizializzazione
      qrCode.current = new QRCodeStyling({
        width: DISPLAY_SIZE,
        height: DISPLAY_SIZE,
        type: "svg",
        data: getQRData(),
        image: qrImage, // 5. Icona al centro
        dotsOptions: { color: fgColor, type: dotStyle },
        backgroundOptions: { color: bgColor },
        cornersSquareOptions: { type: eyeStyle, color: fgColor },
        cornersDotOptions: { type: cornerDotStyle, color: fgColor }, // 4. Stile punti angoli
        qrOptions: { errorCorrectionLevel: "H", typeNumber: 0, mode: "Byte" },
        imageOptions: {
          imageSize: 0.4,
          margin: 1,
          hideBackgroundDots: true,
        },
      });
      qrRef.current.innerHTML = ""; // Pulisci prima di aggiungere
      qrCode.current.append(qrRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getQRData,
    fgColor,
    bgColor,
    dotStyle,
    eyeStyle,
    cornerDotStyle,
    qrImage,
    type,
    selectedSocial,
    isValid,
  ]);
  // Rimosso qrRef.current dalle dipendenze per evitare loop di re-inizializzazione

  const enhanceQRforIOS = (svgElement) => {
    /* ... (invariato) ... */
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const paths = svgElement.querySelectorAll("path, rect");
      paths.forEach((path) => {
        path.setAttribute("shape-rendering", "crispEdges");
        if (path.getAttribute("fill")) path.setAttribute("fill-opacity", "1");
      });
    }
    return svgElement;
  };

  // 3. Aumento Qualità Download & 6. Ingrandimento Icona Social nel PDF
  const downloadQR = async () => {
    try {
      const svgElement = qrRef.current?.querySelector("svg");
      if (!svgElement) {
        console.error("SVG element for QR not found");
        return;
      }
  
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      // Aumenta pixelRatio per una qualità ancora maggiore, specialmente per iOS
      const pixelRatio = Math.min(
        isIOS ? 4 : 2.5,
        window.devicePixelRatio || 2.5,
      );
  
      // Dimensioni base del canvas (verranno moltiplicate per pixelRatio)
      const baseCanvasWidth = 1000;
      const baseCanvasHeight = 1200;
  
      const canvas = document.createElement("canvas");
      canvas.width = baseCanvasWidth * pixelRatio;
      canvas.height = baseCanvasHeight * pixelRatio;
      Object.assign(canvas.style, {
        width: `${baseCanvasWidth}px`,
        height: `${baseCanvasHeight}px`,
      });
  
      const ctx = canvas.getContext("2d");
      ctx.scale(pixelRatio, pixelRatio); // Scala il contesto per disegnare ad alta risoluzione
  
      // Sfondo del PDF (canvas principale)
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, baseCanvasWidth, baseCanvasHeight);
  
      // SOLUZIONE PER TUTTI I DISPOSITIVI:
      // Sempre rimuoviamo l'icona centrale e la disegniamo manualmente
      // per garantire la coerenza su tutti i dispositivi
      
      // 1. Rendering base del QR
      const qrSizeOnCanvas = 780;
      const qrX = (baseCanvasWidth - qrSizeOnCanvas) / 2;
      const qrY = 60;
  
      // Clona e migliora l'SVG per il rendering
      const svgClone = isIOS ? enhanceQRforIOS(svgElement.cloneNode(true)) : svgElement.cloneNode(true);
      const svgRenderWidth = 880;
      const svgRenderHeight = 880;
      svgClone.setAttribute("width", String(svgRenderWidth));
      svgClone.setAttribute("height", String(svgRenderHeight));
      svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      
      // Rimuovi opacità da tutti gli elementi per evitare problemi
      Array.from(svgClone.querySelectorAll("*")).forEach(el => {
        el.style.opacity = "1";
        el.removeAttribute("filter");
      });
      
      // Rimuoviamo sempre l'icona centrale se è un QR sociale
      let centralIconRemoved = false;
      if (type === "social") {
        const imageElements = Array.from(svgClone.querySelectorAll("image"));
        if (imageElements.length > 0) {
          // Rimuoviamo temporaneamente l'elemento immagine
          imageElements.forEach(img => {
            if (img.parentNode) {
              img.parentNode.removeChild(img);
              centralIconRemoved = true;
            }
          });
        }
      }
  
      const svgData = new XMLSerializer().serializeToString(svgClone);
      
      // Primo rendering: QR base senza icona centrale
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        
        const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
        const svgUrl = URL.createObjectURL(svgBlob);
        
        img.onload = () => {
          ctx.imageSmoothingEnabled = false;
          ctx.drawImage(img, qrX, qrY, qrSizeOnCanvas, qrSizeOnCanvas);
          
          if (isIOS) {
            // Secondo passaggio per maggiore nitidezza
            Object.assign(ctx, {
              shadowColor: fgColor,
              shadowBlur: 0.5,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              globalCompositeOperation: "source-over",
            });
            ctx.drawImage(img, qrX, qrY, qrSizeOnCanvas, qrSizeOnCanvas);
            ctx.shadowBlur = 0;
          }
          
          ctx.imageSmoothingEnabled = true;
          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        
        img.onerror = (e) => {
          console.error("Image load error for QR SVG:", e);
          URL.revokeObjectURL(svgUrl);
          reject(e);
        };
        
        img.src = svgUrl;
      });
  
      // 2. Aggiungiamo sempre manualmente l'icona al centro per QR sociali
      if (type === "social" && centralIconRemoved && selectedSocial) {
        try {
          // Calcoliamo le dimensioni dell'icona centrale
          const iconSize = qrSizeOnCanvas * 0.25; // 25% della dimensione del QR
          const iconX = qrX + (qrSizeOnCanvas - iconSize) / 2;
          const iconY = qrY + (qrSizeOnCanvas - iconSize) / 2;
          
          // Invece di usare getSocialIconSvgDataUrl, rendiamo direttamente ogni icona come immagine
          const IconComponent = {
            instagram: FaInstagram,
            facebook: FaFacebookF,
            linkedin: FaLinkedin,
            tiktok: FaTiktok,
          }[selectedSocial];
  
          if (IconComponent) {
            // Renderizza direttamente l'icona React con il fgColor del QR
            const iconMarkup = ReactDOMServer.renderToStaticMarkup(
              <div style={{ 
                fontSize: `${iconSize}px`, 
                color: fgColor,
                width: `${iconSize}px`,
                height: `${iconSize}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <IconComponent />
              </div>
            );
  
            const tempDiv = document.createElement("div");
            Object.assign(tempDiv.style, {
              position: "fixed",
              top: "-3000px",
              left: "-3000px",
              width: `${iconSize}px`,
              height: `${iconSize}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "transparent",
            });
            tempDiv.innerHTML = iconMarkup;
            document.body.appendChild(tempDiv);
  
            try {
              const iconCanvas = await html2canvas(tempDiv, {
                backgroundColor: null,
                scale: isIOS ? 4 : 3,
                useCORS: true,
                logging: false,
              });
  
              const iconImage = new Image();
              iconImage.src = iconCanvas.toDataURL("image/png", 1.0);
  
              await new Promise((res, rej) => {
                iconImage.onload = () => {
                  ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
                  res();
                };
                iconImage.onerror = (e) => {
                  console.error("Image load error for central social icon:", e);
                  rej(e);
                };
              });
            } finally {
              if (document.body.contains(tempDiv)) {
                document.body.removeChild(tempDiv);
              }
            }
          }
        } catch (iconErr) {
          console.error("Error drawing center icon:", iconErr);
          // Continua anche se l'icona centrale fallisce
        }
      }
  
      // 3. Icona social e username SOTTO il QR code
      if (type === "social" && username) {
        const tagY = baseCanvasHeight * 0.83;
        const iconSizeInPdf = 90;
        const usernameFontSize = 60;
  
        const IconComponent = {
          instagram: FaInstagram,
          facebook: FaFacebookF,
          linkedin: FaLinkedin,
          tiktok: FaTiktok,
        }[selectedSocial];
  
        if (IconComponent) {
          // Renderizza l'icona React con il fgColor del QR per coerenza di stile
          const iconMarkup = ReactDOMServer.renderToStaticMarkup(
            <div style={{ fontSize: `${iconSizeInPdf}px`, color: fgColor }}>
              <IconComponent />
            </div>,
          );
  
          const tempDiv = document.createElement("div");
          Object.assign(tempDiv.style, {
            position: "fixed",
            top: "-3000px",
            left: "-3000px",
            width: `${iconSizeInPdf * 1.5}px`,
            height: `${iconSizeInPdf * 1.5}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
          });
          tempDiv.innerHTML = iconMarkup;
          document.body.appendChild(tempDiv);
  
          try {
            const iconCanvas = await html2canvas(tempDiv, {
              backgroundColor: null,
              scale: isIOS ? 4 : 3,
              useCORS: true,
              logging: false,
            });
  
            const iconImage = new Image();
            iconImage.src = iconCanvas.toDataURL("image/png", 1.0);
  
            await new Promise((res, rej) => {
              iconImage.onload = () => {
                ctx.font = `bold ${usernameFontSize}px sans-serif`;
                ctx.fillStyle = fgColor;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
  
                const text = `@${username}`;
                const textMetrics = ctx.measureText(text);
                const textWidth = textMetrics.width;
                const spacing = 15;
                const totalWidth = iconSizeInPdf + spacing + textWidth;
  
                const currentIconX = (baseCanvasWidth - totalWidth) / 2;
                const currentIconY = tagY - iconSizeInPdf / 2;
  
                ctx.drawImage(
                  iconImage,
                  currentIconX,
                  currentIconY,
                  iconSizeInPdf,
                  iconSizeInPdf,
                );
  
                ctx.fillText(
                  text,
                  currentIconX + iconSizeInPdf + spacing,
                  tagY,
                );
                res();
              };
              iconImage.onerror = (e) => {
                console.error("Image load error for social icon:", e);
                rej(e);
              };
            });
          } finally {
            if (document.body.contains(tempDiv)) {
              document.body.removeChild(tempDiv);
            }
          }
        }
      }
  
      // Footer "QRastic!" nel PDF
      ctx.font = `bold ${32}px sans-serif`;
      ctx.fillStyle = "#4A4A4A";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText("QRastic!", baseCanvasWidth / 2, baseCanvasHeight - 25);
  
      // Usa JPEG con qualità molto alta per il PDF
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.98);
  
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });
  
      const pdfPageWidth = pdf.internal.pageSize.getWidth();
      const pdfPageHeight = pdf.internal.pageSize.getHeight();
  
      const aspectRatio = baseCanvasWidth / baseCanvasHeight;
      let imgWidthInPdf = pdfPageWidth * 0.9;
      let imgHeightInPdf = imgWidthInPdf / aspectRatio;
  
      if (imgHeightInPdf > pdfPageHeight * 0.95) {
        imgHeightInPdf = pdfPageHeight * 0.95;
        imgWidthInPdf = imgHeightInPdf * aspectRatio;
      }
  
      const pdfMarginX = (pdfPageWidth - imgWidthInPdf) / 2;
      const pdfMarginY = (pdfPageHeight - imgHeightInPdf) / 2;
  
      pdf.addImage(
        imageDataUrl,
        "JPEG",
        pdfMarginX,
        pdfMarginY,
        imgWidthInPdf,
        imgHeightInPdf,
        undefined,
        "FAST",
      );
      pdf.save("QRastic-Code.pdf");
    } catch (err) {
      console.error("Error during PDF export:", err);
      alert(
        "An error occurred while creating the PDF. Check console for details.",
      );
    }
  };


  const applyColorTheme = (theme) => {
    setFgColor(theme.fg);
    setBgColor(theme.bg);
  };

  const renderInputField = () => {
    switch (type) {
      case "social":
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Social Platform:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Object.keys(socialBaseUrls).map((social) => (
                  <button
                    key={social}
                    className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all text-white ${selectedSocial === social ? "bg-gray-700 ring-2 ring-white" : "bg-gray-800 hover:bg-gray-700 border border-gray-600"}`}
                    onClick={() => setSelectedSocial(social)}
                  >
                    {React.cloneElement(socialIcons[social], { size: 20 })}
                    <span
                      className={`text-xs mt-1.5 capitalize font-medium ${selectedSocial === social ? "text-white" : "text-gray-300"}`}
                    >
                      {social}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Username:
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 text-base font-medium">
                  @
                </span>
                <input
                  type="text"
                  className="w-full pl-8 p-2.5 border border-gray-600 rounded-lg focus:ring-white focus:border-white bg-gray-700 text-white shadow-sm placeholder-gray-400"
                  placeholder="your.username"
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
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              {type === "link"
                ? "URL:"
                : type === "image"
                  ? "Image URL:"
                  : type === "pdf"
                    ? "PDF URL:"
                    : "Value:"}
            </label>
            <input
              type="text"
              className="w-full p-2.5 border border-gray-600 rounded-lg focus:ring-white focus:border-white bg-gray-700 text-white shadow-sm placeholder-gray-400"
              placeholder={
                type === "link"
                  ? "https://example.com"
                  : type === "image"
                    ? "https://example.com/image.jpg"
                    : type === "pdf"
                      ? "https://example.com/document.pdf"
                      : "Enter value"
              }
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <Header
        siteTitle="QRastic!"
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <SidebarMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      <main
        className={`p-4 md:p-8 transition-transform duration-300 ease-in-out ${isMenuOpen ? "blur-sm md:blur-none pointer-events-none md:pointer-events-auto" : ""}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            <div className="lg:w-2/5 bg-gray-900 p-5 md:p-6 rounded-xl shadow-xl space-y-5 ring-1 ring-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  QR Code Type:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(typeIcons).map(([key, icon]) => (
                    <button
                      key={key}
                      className={`p-3 rounded-lg flex flex-col items-center justify-center transition-all text-white ${type === key ? "bg-gray-700 ring-2 ring-white shadow-md" : "bg-gray-800 hover:bg-gray-700 border border-gray-600"}`}
                      onClick={() => {
                        setType(key);
                        setValue("");
                        setUsername("");
                        setIsValid(false);
                      }}
                    >
                      <div
                        className={`text-xl md:text-2xl ${type === key ? "text-white" : "text-gray-400"}`}
                      >
                        {icon}
                      </div>
                      <span
                        className={`text-xs mt-2 font-medium capitalize ${type === key ? "text-white" : "text-gray-300"}`}
                      >
                        {key}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {renderInputField()}
              <div className="border-t border-gray-700 pt-5">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-gray-200 mb-3"
                  onClick={() => setShowColorThemes(!showColorThemes)}
                >
                  <div className="flex items-center text-lg">
                    <HiColorSwatch className="mr-3 text-gray-400" /> Color
                    Themes
                  </div>
                  <span className="text-gray-400">
                    {showColorThemes ? "▲" : "▼"}
                  </span>
                </button>
                {showColorThemes && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                      {initialColorThemes.map(
                        (
                          theme,
                          index, // 1. Usa initialColorThemes
                        ) => (
                          <button
                            key={index}
                            className="p-2 rounded-lg border border-gray-600 hover:border-white hover:shadow-md transition-all flex items-center bg-gray-800"
                            onClick={() => applyColorTheme(theme)}
                            title={theme.name}
                          >
                            <div
                              className="w-6 h-6 rounded-full mr-2 shadow-sm shrink-0"
                              style={{
                                backgroundColor: theme.fg,
                                border: `3px solid ${theme.bg}`,
                              }}
                            />
                            <span className="text-xs font-medium text-gray-300 truncate">
                              {theme.name}
                            </span>
                          </button>
                        ),
                      )}
                    </div>
                    <div className="mt-4">
                      <button
                        className="text-gray-300 font-medium flex items-center text-sm hover:text-white transition-colors"
                        onClick={() => setShowCustomColors(!showCustomColors)}
                      >
                        {showCustomColors
                          ? "↑ Hide Custom Colors"
                          : "✨ Customize Colors"}
                      </button>
                      {showCustomColors /* ... (color pickers invariati) ... */ && (
                        <div className="grid grid-cols-2 gap-4 mt-3 bg-gray-800 p-3 rounded-lg shadow-sm ring-1 ring-gray-700">
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              QR Color:
                            </label>
                            <input
                              type="color"
                              className="w-full h-10 p-1 rounded-lg border border-gray-600 bg-gray-700 shadow-sm cursor-pointer"
                              value={fgColor}
                              onChange={(e) => setFgColor(e.target.value)}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1">
                              Background:
                            </label>
                            <input
                              type="color"
                              className="w-full h-10 p-1 rounded-lg border border-gray-600 bg-gray-700 shadow-sm cursor-pointer"
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
              <div className="border-t border-gray-700 pt-5">
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-gray-200 mb-3"
                  onClick={() => setShowStyleOptions(!showStyleOptions)}
                >
                  <div className="flex items-center text-lg">
                    <span className="mr-3 text-xl">🖌️</span> Style Options
                  </div>
                  <span className="text-gray-400">
                    {showStyleOptions ? "▲" : "▼"}
                  </span>
                </button>
                {showStyleOptions && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Dot Style:
                      </label>
                      <select
                        className="w-full p-2.5 border border-gray-600 rounded-lg focus:ring-white focus:border-white bg-gray-700 text-white shadow-sm text-sm"
                        value={dotStyle}
                        onChange={(e) => setDotStyle(e.target.value)}
                      >
                        <option value="square">Square</option>
                        <option value="dots">Dots</option>
                        <option value="rounded">Rounded</option>
                        <option value="classy">Classy</option>
                        <option value="classy-rounded">Classy Rounded</option>
                        <option value="extra-rounded">Extra Rounded</option>
                      </select>
                    </div>
                    <div>
                      {" "}
                      {/* Stile per i frame degli angoli */}
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Corner Frame Style:
                      </label>
                      <select
                        className="w-full p-2.5 border border-gray-600 rounded-lg focus:ring-white focus:border-white bg-gray-700 text-white shadow-sm text-sm"
                        value={eyeStyle}
                        onChange={(e) => setEyeStyle(e.target.value)}
                      >
                        <option value="square">Square</option>
                        <option value="dot">Dot</option>
                        <option value="extra-rounded">Extra Rounded</option>
                      </select>
                    </div>
                    {/* 4. Aggiunta selezione per Stile Punti Interni Angoli */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Corner Inner Dot Style:
                      </label>
                      <select
                        className="w-full p-2.5 border border-gray-600 rounded-lg focus:ring-white focus:border-white bg-gray-700 text-white shadow-sm text-sm"
                        value={cornerDotStyle}
                        onChange={(e) => setCornerDotStyle(e.target.value)}
                      >
                        <option value="dot">Dot</option>
                        <option value="square">Square</option>
                        {/* Aggiungi qui altre opzioni se qr-code-styling le supporta per cornersDotOptions.type */}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:w-3/5 bg-gray-900 p-5 md:p-8 rounded-xl shadow-xl flex flex-col items-center justify-center ring-1 ring-gray-700">
              <div
                id="qr-container"
                className="flex-1 flex flex-col items-center justify-center w-full mb-6"
              >
                <div
                  className={`transition-opacity duration-300 ${isValid ? "opacity-100" : "opacity-50"}`}
                >
                  <div className="bg-white p-3 md:p-4 rounded-lg shadow-2xl">
                    {" "}
                    {/* Sfondo bianco per il QR */}
                    <div
                      ref={qrRef}
                      className="border border-gray-200 rounded-md p-1 shadow-inner"
                    />{" "}
                    {/* Padding ridotto per far spazio al qr */}
                  </div>
                </div>
                {type === "social" &&
                  username &&
                  isValid /* ... (tag social invariato) ... */ && (
                    <div className="mt-5 mb-2 text-center flex items-center justify-center space-x-3 bg-gray-800 px-5 py-2.5 rounded-full shadow">
                      <span
                        style={{
                          color: socialIcons[
                            selectedSocial
                          ]?.props?.className.includes("pink")
                            ? "rgb(236, 72, 153)"
                            : socialIcons[
                                  selectedSocial
                                ]?.props?.className.includes("blue-600")
                              ? "rgb(37, 99, 235)"
                              : socialIcons[
                                    selectedSocial
                                  ]?.props?.className.includes("blue-700")
                                ? "rgb(29,78,216)"
                                : fgColor === "#000000"
                                  ? "#FFFFFF"
                                  : fgColor,
                        }}
                      >
                        {React.cloneElement(socialIcons[selectedSocial], {
                          size: 20,
                        })}
                      </span>
                      <span className="font-medium text-gray-200 text-sm md:text-base">
                        @{username}
                      </span>
                    </div>
                  )}
                <p className="text-gray-500 text-xs mt-3 font-sans">
                  QR Code generated with QRastic!
                </p>
              </div>
              <div className="w-full max-w-md mt-auto">
                <button
                  onClick={downloadQR}
                  disabled={!isValid}
                  className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-lg shadow-md font-semibold text-lg transition-all duration-150 ease-in-out
                    ${isValid ? "bg-white text-black hover:bg-gray-200 active:bg-gray-300 transform active:scale-[0.98]" : "bg-gray-700 text-gray-500 cursor-not-allowed"}`}
                >
                  <FaDownload size={20} /> Download QR Code (PDF)
                </button>
                {!isValid /* ... (messaggio errore invariato) ... */ && (
                  <p className="text-red-400 text-xs mt-2.5 text-center font-medium">
                    {type === "social"
                      ? "Please enter a username."
                      : "Please enter a valid URL."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sezioni Footer invariate */}
          <div
            id="about"
            className="mt-12 p-6 bg-gray-900 rounded-xl shadow-xl ring-1 ring-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 text-white">
              About QRastic!
            </h2>
            <p className="text-gray-300">
              <strong>QRastic!</strong> is a free and modern QR code generator
              that helps you create fully customizable static QR codes in
              seconds — no accounts, no paywalls, no nonsense. Just enter your
              data, pick a style, and download your QR code as a high-quality
              PDF.
            </p>
            <p className="text-gray-300 mt-3">
              This tool exists because we believe static QR codes — which are
              simple, fast, and don't rely on external services — should be free
              for everyone. There's no reason to pay a subscription or share
              your personal data just to generate a basic QR code.
            </p>
            <p className="text-gray-300 mt-3">
              Whether you’re a student, small business owner, or just curious,
              QRastic! is here to give you everything you need — with full
              control over style and color — without hidden fees or locked
              features.
            </p>
          </div>

          <div
            id="cookies"
            className="mt-12 p-6 bg-gray-900 rounded-xl shadow-xl ring-1 ring-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 text-white">Cookies?</h2>
            <p className="text-gray-300">
              Nope. We don’t use cookies — we’re not here to track you, sell
              your data, or build a creepy profile. We're just here to help you
              generate QR codes.
            </p>
            <p className="text-gray-300 mt-3">
              After all, it’s just a square made of smaller squares. Why would
              we need to spy on you for that?
            </p>
          </div>

          <div
            id="support"
            className="mt-12 p-6 bg-gray-900 rounded-xl shadow-xl ring-1 ring-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 text-white">
              Support QRastic!
            </h2>
            <p className="text-gray-300">
              If you love QRastic!, consider supporting its development. Your
              contributions help keep the service free and constantly improving.
              <a
                href="https://paypal.me/ValerioLeone14"
                className="text-blue-400 underline hover:text-blue-300 ml-1"
              >
                Support me
              </a>
            </p>
          </div>
          <div
            id="licenses"
            className="mt-8 p-6 bg-gray-900 rounded-xl shadow-xl ring-1 ring-gray-700"
          >
            <h2 className="text-2xl font-semibold mb-3 text-white">Licenses</h2>
            <p className="text-gray-300">
              QRastic! utilizes several open-source libraries. We are grateful
              to the developers of these tools. (Detailed license information
              for each library will be listed here).
            </p>
            <button
              onClick={() => setShowLicenses((prev) => !prev)}
              className="text-sm text-blue-400 underline hover:text-blue-300 mb-3"
            >
              {showLicenses ? "Hide Licenses" : "Show Licenses"}
            </button>
            {showLicenses && (
              <div className="space-y-3 border-t border-gray-700 pt-4">
                <div>
                  <p className="font-semibold text-white">1. Next.js</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/vercel/next.js"
                      className="text-blue-400 hover:underline"
                    >
                      vercel/next.js
                    </a>
                  </p>
                  <p>License: MIT — © Vercel</p>
                </div>
                <div>
                  <p className="font-semibold text-white">2. Tailwind CSS</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/tailwindlabs/tailwindcss"
                      className="text-blue-400 hover:underline"
                    >
                      tailwindlabs/tailwindcss
                    </a>
                  </p>
                  <p>License: MIT — © Tailwind Labs</p>
                </div>
                <div>
                  <p className="font-semibold text-white">3. qr-code-styling</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/kozakdenys/qr-code-styling"
                      className="text-blue-400 hover:underline"
                    >
                      kozakdenys/qr-code-styling
                    </a>
                  </p>
                  <p>License: MIT — © 2020 Denys Kozak</p>
                </div>
                <div>
                  <p className="font-semibold text-white">4. html2canvas</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/niklasvh/html2canvas"
                      className="text-blue-400 hover:underline"
                    >
                      niklasvh/html2canvas
                    </a>
                  </p>
                  <p>License: MIT — © 2011 Niklas von Hertzen</p>
                </div>
                <div>
                  <p className="font-semibold text-white">5. jsPDF</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/parallax/jsPDF"
                      className="text-blue-400 hover:underline"
                    >
                      parallax/jsPDF
                    </a>
                  </p>
                  <p>License: MIT — © 2010 James Hall</p>
                </div>
                <div>
                  <p className="font-semibold text-white">6. react-icons</p>
                  <p>
                    Repository:{" "}
                    <a
                      href="https://github.com/react-icons/react-icons"
                      className="text-blue-400 hover:underline"
                    >
                      react-icons/react-icons
                    </a>
                  </p>
                  <p>License: MIT — © 2016 React Icons contributors</p>
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <pre className="whitespace-pre-wrap bg-gray-800 p-4 rounded-lg text-xs text-gray-300 overflow-auto">
                    {`MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.`}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="text-center p-6 mt-10 border-t border-gray-700">
        <p className="text-sm text-gray-500">
          {" "}
          {new Date().getFullYear()} QRastic! - Modern QR Code Generator.
        </p>
      </footer>
    </div>
  );
}