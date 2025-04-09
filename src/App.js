import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextField,
  Typography,
  Paper,
  Box,
  IconButton,
  Button,
  useMediaQuery,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import { useTheme, createTheme, ThemeProvider } from "@mui/material/styles";
import {
  SaveAlt as SaveAltIcon,
  Clear as ClearIcon,
  Brightness4 as Brightness4Icon,
  Brightness7 as Brightness7Icon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import QRCode from "qrcode";
import "./App.css"; // Make sure your App.css has global styles for dark mode

function App() {
  const [input, setInput] = useState("");
  const [qrColor, setQrColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff"); // New state for background color
  const [qrSize, setQrSize] = useState(256);
  const [darkMode, setDarkMode] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [logo, setLogo] = useState(null);
  const [logoName, setLogoName] = useState("");
  const [errorCorrectionLevel, setErrorCorrectionLevel] = useState("H"); // New state for error correction level
  const qrCodeCanvasRef = useRef(null);

  const handleInputChange = (e) => setInput(e.target.value);
  const handleColorChange = (e) => setQrColor(e.target.value);
  const handleBgColorChange = (e) => setBgColor(e.target.value); // Handler for background color
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setSnackbarMessage(
          "File size exceeds 2MB. Please upload a smaller image."
        );
        setSnackbarOpen(true);
        return;
      }
      const logoURL = URL.createObjectURL(file);
      setLogo(logoURL);
      setLogoName(file.name);
    }
  };

  const removeLogo = () => {
    setLogo(null);
    setLogoName("");
  };

  const handleErrorCorrectionLevelChange = (e) =>
    setErrorCorrectionLevel(e.target.value); // Handler for error correction level
  const clearInput = () => setInput("");

  const handleFileClick = () => {
    const fileInput = document.getElementById("file-input");
    fileInput.click();
  };

  const downloadQRCode = () => {
    const canvas = qrCodeCanvasRef.current;
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr_code.png";
    a.click();
  };

  const copyQRCodeToClipboard = () => {
    const canvas = qrCodeCanvasRef.current;
    const url = canvas.toDataURL("image/png");
    navigator.clipboard.writeText(url).then(() => {
      setSnackbarMessage("QR Code copied to clipboard!");
      setSnackbarOpen(true);
    });
  };

  const theme = createTheme({
    palette: {
      mode: darkMode ? "dark" : "light",
      primary: {
        main: darkMode ? "#1E88E5" : "#007AFF",
      },
      background: {
        default: darkMode ? "#121212" : "#F5F5F7",
        paper: darkMode ? "#1E1E1E" : "#FFFFFF",
      },
      text: {
        primary: darkMode ? "#FFFFFF" : "#333333",
        secondary: darkMode ? "#A1A1A6" : "#A1A1A6",
      },
    },
    typography: {
      fontFamily: "Roboto, sans-serif",
      h3: { fontWeight: 600 },
      body1: { fontWeight: 400 },
    },
  });

  const muiTheme = useTheme();
  const isSmallScreen = useMediaQuery(muiTheme.breakpoints.down("md"));

  // Apply dark/light mode globally
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--bg-color",
      darkMode ? "#121212" : "#F5F5F7"
    );
    document.documentElement.style.setProperty(
      "--text-color",
      darkMode ? "#ffffff" : "#333333"
    );
  }, [darkMode]);

  // Generate QR code using the qrcode library
  useEffect(() => {
    const canvas = qrCodeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    // Resize main canvas: no extra space for frame text
    canvas.width = qrSize;
    canvas.height = qrSize;

    // Create offscreen canvas to generate raw QR code
    const offCanvas = document.createElement("canvas");
    offCanvas.width = qrSize;
    offCanvas.height = qrSize;
    const offCtx = offCanvas.getContext("2d");

    QRCode.toCanvas(
      offCanvas,
      input ||
        "https://play.google.com/store/apps/details?id=com.rovenkodev.FitnessGuru",
      {
        color: {
          dark: qrColor,
          light: bgColor, // Use the selected background color
        },
        width: qrSize,
        errorCorrectionLevel,
      },
      (error) => {
        if (error) {
          console.error(error);
          return;
        }

        // Clear visible canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw QR code from offscreen to visible canvas
        ctx.drawImage(offCanvas, 0, 0);

        // Draw logo (if present)
        if (logo) {
          const logoImage = new Image();
          logoImage.onload = () => {
            const logoSize = qrSize / 4;
            const logoX = (qrSize - logoSize) / 2;
            const logoY = (qrSize - logoSize) / 2;
            ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
          };
          logoImage.src = logo;
        }
      }
    );
  }, [logo, input, qrColor, qrSize, errorCorrectionLevel, bgColor]); // Add bgColor as dependency

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mt: 10, px: 2 }}>
        <Paper
          elevation={6}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: isSmallScreen ? "column" : "row",
            gap: 4,
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Settings Panel */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h3" color="primary" gutterBottom>
              QR Code Generator
            </Typography>

            <TextField
              label="Enter text or URL"
              variant="outlined"
              fullWidth
              value={input}
              onChange={handleInputChange}
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: darkMode ? "#333333" : "#F5F5F7", // Dark mode background
                boxShadow: darkMode
                  ? "0 2px 8px rgba(255,255,255,0.1)"
                  : "0 2px 8px rgba(0,0,0,0.05)",
                color: darkMode ? "#ffffff" : "#333333", // Text color for dark mode
              }}
            />

            <Typography variant="body1" color="textSecondary" mb={1}>
              Choose QR Code Color
            </Typography>
            <input
              type="color"
              value={qrColor}
              onChange={handleColorChange}
              style={{
                marginBottom: 24,
                borderRadius: "5px",
                width: "100%",
                backgroundColor: darkMode ? "#555" : "#FFF",
              }}
            />

            <Typography variant="body1" color="textSecondary" mb={1}>
              Choose Background Color
            </Typography>
            <input
              type="color"
              value={bgColor} // Bind to the background color state
              onChange={handleBgColorChange}
              style={{
                marginBottom: 24,
                borderRadius: "5px",
                width: "100%",
                backgroundColor: darkMode ? "#555" : "#FFF",
              }}
            />

            <Typography variant="body1" color="textSecondary" mb={1}>
              Select QR Code Size
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
              <Box
                component="button"
                onClick={() => setQrSize(150)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: qrSize === 150 ? "primary.main" : "#ccc",
                  backgroundColor:
                    qrSize === 150 ? "primary.main" : "transparent",
                  color: qrSize === 150 ? "#fff" : "text.primary",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Small
              </Box>
              <Box
                component="button"
                onClick={() => setQrSize(256)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: qrSize === 256 ? "primary.main" : "#ccc",
                  backgroundColor:
                    qrSize === 256 ? "primary.main" : "transparent",
                  color: qrSize === 256 ? "#fff" : "text.primary",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Medium
              </Box>
              <Box
                component="button"
                onClick={() => setQrSize(350)}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  border: "1px solid",
                  borderColor: qrSize === 350 ? "primary.main" : "#ccc",
                  backgroundColor:
                    qrSize === 350 ? "primary.main" : "transparent",
                  color: qrSize === 350 ? "#fff" : "text.primary",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Large
              </Box>
            </Box>

            {/* Error correction level */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="error-correction-label">
                Error Correction
              </InputLabel>
              <Select
                labelId="error-correction-label"
                value={errorCorrectionLevel}
                label="Error Correction"
                onChange={handleErrorCorrectionLevelChange}
              >
                <MenuItem value="L">L (Low)</MenuItem>
                <MenuItem value="M">M (Medium)</MenuItem>
                <MenuItem value="Q">Q (Quartile)</MenuItem>
                <MenuItem value="H">H (High)</MenuItem>
              </Select>
            </FormControl>

            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: "none" }}
            />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleFileClick}
              >
                Choose Image
              </Button>
              <Typography variant="body2">
                {logoName || "Upload Logo"}
              </Typography>
              {logo && (
                <IconButton onClick={removeLogo} sx={{ color: "#FF4F4F" }}>
                  <ClearIcon />
                </IconButton>
              )}
            </Box>
          </Box>

          {/* QR Display Panel */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: isSmallScreen ? "auto" : "400px",
              padding: "20px",
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <canvas
              ref={qrCodeCanvasRef}
              style={{ padding: "20px", borderRadius: "8px" }}
            />
            {/* QR Download and Copy */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                mt: 2,
              }}
            >
              <IconButton
                onClick={downloadQRCode}
                sx={{
                  color: darkMode ? "#007AFF" : "#FFFFFF",
                  backgroundColor: darkMode ? "transparent" : "#007AFF",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: darkMode ? "transparent" : "#005BB5",
                  },
                }}
                title="Download"
              >
                <SaveAltIcon />
              </IconButton>

              <IconButton
                onClick={clearInput}
                sx={{
                  color: darkMode ? "#FF4F4F" : "#FFFFFF",
                  backgroundColor: darkMode ? "transparent" : "#FF4F4F",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  "&:hover": {
                    backgroundColor: darkMode ? "transparent" : "#FF2A2A",
                  },
                }}
                title="Clear"
              >
                <ClearIcon />
              </IconButton>

              <IconButton
                onClick={copyQRCodeToClipboard}
                sx={{
                  color: darkMode ? "#FFEB3B" : "#FFFFFF",
                  backgroundColor: darkMode ? "transparent" : "#FFEB3B",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  "&:hover": {
                    backgroundColor: darkMode ? "transparent" : "#FFBF00",
                  },
                }}
                title="Copy QR Code"
              >
                <ContentCopyIcon />
              </IconButton>

              <IconButton
                onClick={() => setDarkMode(!darkMode)}
                sx={{
                  color: darkMode ? "#FFEB3B" : "#007AFF",
                }}
                title="Toggle Dark Mode"
              >
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Box>
          </Box>
        </Paper>
        {/* About and Privacy Policy Section */}
        <Paper
          elevation={6} // Same elevation as the QR code section
          sx={{
            mt: 5,
            p: 4,
            borderRadius: 4,
            backgroundColor: theme.palette.background.paper,
            marginBottom: "30px", // Added space at the bottom
          }}
        >
          <Typography variant="h6" color="primary" gutterBottom>
            About QR Code Generator
          </Typography>
          <Typography variant="body1" paragraph>
            The QR Code Generator is a powerful tool designed to help you create
            custom QR codes for a variety of purposes. Whether you're looking to
            share a link, encode text, or integrate your business or branding
            into a QR code, this tool makes it easy to customize the look and
            feel of your QR codes. With advanced features like color
            customization, logo integration, and error correction levels, our QR
            code generator provides the flexibility you need for professional
            use.
          </Typography>
          <Typography variant="body1" paragraph>
            Key Features:
            <ul>
              <li>Customizable QR code color and background.</li>
              <li>Logo upload to personalize your QR code.</li>
              <li>Adjustable QR code size for different use cases.</li>
              <li>
                Supports various error correction levels for improved
                scannability.
              </li>
              <li>Download QR codes in high-quality PNG format.</li>
            </ul>
            Our QR Code Generator is ideal for businesses, marketers,
            developers, and individuals who need to create professional,
            high-quality QR codes quickly and easily. Whether you're using it
            for marketing campaigns, product packaging, or event management,
            this tool offers everything you need to create QR codes that are
            visually appealing and functional.
          </Typography>

          <Typography variant="h6" color="primary" gutterBottom>
            Privacy Policy
          </Typography>
          <Typography variant="body1" paragraph>
            At QR Code Generator, we value your privacy and are committed to
            protecting your personal data. This service does not collect or
            store any personally identifiable information (PII) from users. All
            QR codes are generated locally on your device, and no data is
            transmitted to external servers during the process. Any images you
            upload (such as logos) are processed entirely within your browser
            and are not stored or shared.
          </Typography>
          <Typography variant="body1" paragraph>
            We use standard web technologies to ensure the security of your data
            and to provide the best experience. All QR codes and their
            associated data are discarded once you leave the page. No
            third-party tracking or advertising services are implemented on this
            page beyond the use of Google AdSense for monetization.
          </Typography>
          <Typography variant="body1" paragraph>
            <strong>Data we do not collect:</strong>
            <ul>
              <li>
                Personal information such as names, email addresses, or phone
                numbers.
              </li>
              <li>QR code contents or scan history.</li>
              <li>Uploaded files (images) are not stored or shared.</li>
            </ul>
            Your trust is important to us. We are continuously working to
            improve the transparency and security of our services.
          </Typography>

          <Typography variant="body1" paragraph>
            QR Code Generator is proudly made by <strong>Rovenkodev</strong>.
            Thank you for using our tool! <br />
            <strong>This tool is completely free to use!</strong>
          </Typography>
        </Paper>

        {/* Added space at the bottom */}
        <Box sx={{ height: "50px" }} />
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)} // Change this to setSnackbarOpen
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
