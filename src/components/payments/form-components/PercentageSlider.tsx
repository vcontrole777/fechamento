
import { Slider } from "@/components/ui/slider";

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
  return (
    <div className="space-y-4 p-4 bg-muted/50 rounded-md">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="custom-percentage"
          checked={useCustomPercentage}
          onChange={(e) => onToggleCustomPercentage(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
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
            onValueChange={onPercentageChange}
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
