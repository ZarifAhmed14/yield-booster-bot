import { useState, useMemo } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { bangladeshDistricts } from "@/data/districts";
import { useLanguage } from "@/contexts/LanguageContext";

interface DistrictSelectProps {
  value: string;
  onChange: (value: string) => void;
}

const DistrictSelect = ({ value, onChange }: DistrictSelectProps) => {
  const [open, setOpen] = useState(false);
  const { language, t } = useLanguage();

  const selectedDistrict = useMemo(
    () => bangladeshDistricts.find((d) => d.value === value),
    [value]
  );

  const getDisplayName = (district: typeof bangladeshDistricts[0]) => {
    return language === "bn" ? district.bn : district.en;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-14 text-xl justify-between border-2 border-water/30 hover:border-water/50"
        >
          <span className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-water" />
            {selectedDistrict ? getDisplayName(selectedDistrict) : t("form.selectDistrict")}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-card border-2" align="start">
        <Command>
          <CommandInput placeholder={t("form.searchDistrict")} className="h-12" />
          <CommandList>
            <CommandEmpty>{t("form.noDistrictFound")}</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {bangladeshDistricts.map((district) => (
                <CommandItem
                  key={district.value}
                  value={`${district.en} ${district.bn}`}
                  onSelect={() => {
                    onChange(district.value);
                    setOpen(false);
                  }}
                  className="text-lg py-3 cursor-pointer"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === district.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {getDisplayName(district)}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default DistrictSelect;
