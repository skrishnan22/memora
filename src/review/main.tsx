import { createRoot } from "react-dom/client";
import { ReviewApp } from "./components/ReviewApp";
import "./index.css";

const rootElement = document.getElementById("root");

if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<ReviewApp />);
}
