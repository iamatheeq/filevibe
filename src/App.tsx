import { Shell } from "./components/Shell";
import Dashboard from "./pages/Dashboard";
import FileReader from "./pages/FileReader";
import FileConverter from "./pages/FileConverter";
import ReadmeGenerator from "./pages/ReadmeGenerator";
import MarkdownGenerator from "./pages/MarkdownGenerator";
import ImageTools from "./pages/ImageTools";
import ColorStudio from "./pages/ColorStudio";
import PdfEditor from "./pages/PdfEditor";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import { useHashRoute } from "./lib/router";

function Page() {
  const [route] = useHashRoute();
  switch (route) {
    case "/readme":
      return <ReadmeGenerator />;
    case "/reader":
      return <FileReader />;
    case "/pdf":
      return <PdfEditor />;
    case "/images":
      return <ImageTools />;
    case "/colors":
      return <ColorStudio />;
    case "/converter":
      return <FileConverter />;
    case "/generator":
      return <MarkdownGenerator />;
    case "/settings":
      return <Settings />;
    case "/privacy":
      return <Privacy />;
    case "/help":
      return <Help />;
    default:
      return <Dashboard />;
  }
}

export default function App() {
  return (
    <Shell>
      <Page />
    </Shell>
  );
}
