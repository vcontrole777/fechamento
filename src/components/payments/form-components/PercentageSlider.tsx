
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

interface PercentageSliderProps {
  useCustomPercentage: boolean;
  customPercentage: number;
  defaultPercentage: number;
  onPercentageChange: (value: number[]) => void;
  onToggleCustomPercentage: (value: boolean) => void;
}

export function PercentageSlider({
  useCustomPercentage,
  customPercentage,
  defaultPercentage,
  onPercentageChange,
  onToggleCustomPercentage,
}: PercentageSliderProps) {
  console.log("PercentageSlider render:", { useCustomPercentage, customPercentage, defaultPercentage });
  
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2">
        <Checkbox
          id="custom-percentage"
          checked={useCustomPercentage}
          onCheckedChange={(checked) => {
            console.log("Checkbox changed to:", checked);
            onToggleCustomPercentage(checked === true);
          }}
        />
        <label htmlFor="custom-percentage" className="text-sm font-medium">
          Personalizar porcentagem do tripeiro
        </label>
      </div>

      {useCustomPercentage && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm">Porcentagem: {customPercentage}%</span>
            <span className="text-sm font-medium">
              (Padrão: {defaultPercentage}%)
            </span>
          </div>
          <Slider
            value={[customPercentage]}
            min={0}
            max={50}
            step={0.5}
            onValueChange={(value) => {
              console.log("Slider value changed to:", value[0]);
              onPercentageChange(value);
            }}
          />
          <div className="flex gap-2 justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
          </div>
        </div>
      )}
    </div>
  );
}
