import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { Globe, Sprout } from "lucide-react";

const LanguageModal = () => {
  const { showLanguageModal, setLanguage } = useLanguage();

  return (
    <Dialog open={showLanguageModal} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md border-4 border-leaf/30" hideCloseButton>
        <DialogHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-leaf/20 rounded-full">
              <Sprout className="w-12 h-12 text-leaf" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold text-center">
            🌾 KrishiMitra
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Globe className="w-5 h-5" />
            <span className="text-lg">Choose Your Language / ভাষা বাছাই করুন</span>
          </div>
          
          <div className="grid gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLanguage("en")}
              className="h-20 text-2xl border-2 hover:border-leaf hover:bg-leaf/10 transition-all"
            >
              English
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              onClick={() => setLanguage("bn")}
              className="h-20 text-2xl border-2 hover:border-leaf hover:bg-leaf/10 transition-all"
            >
              বাংলা
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LanguageModal;
