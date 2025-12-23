import { Leaf } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-muted/30 py-8 mt-auto">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-leaf" />
            <span className="font-display text-lg font-semibold text-foreground">
              KrishiMitra
            </span>
          </div>
          
          <p className="text-sm text-muted-foreground text-center">
            AI-powered recommendations for sustainable farming in Bangladesh
          </p>
          
          <p className="text-xs text-muted-foreground">
            Hackathon 2024 Project
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
