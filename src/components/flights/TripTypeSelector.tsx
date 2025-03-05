
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Repeat, ArrowRight } from "lucide-react"

interface TripTypeSelectorProps {
  value: 'oneway' | 'roundtrip';
  onChange: (value: 'oneway' | 'roundtrip') => void;
}

const TripTypeSelector = ({ value, onChange }: TripTypeSelectorProps) => {
  return (
    <RadioGroup
      value={value}
      onValueChange={(val) => onChange(val as 'oneway' | 'roundtrip')}
      className="flex space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="oneway" id="oneway" />
        <Label htmlFor="oneway" className="flex items-center cursor-pointer">
          <ArrowRight size={16} className="mr-1" />
          One-way
        </Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="roundtrip" id="roundtrip" />
        <Label htmlFor="roundtrip" className="flex items-center cursor-pointer">
          <Repeat size={16} className="mr-1" />
          Round-trip
        </Label>
      </div>
    </RadioGroup>
  )
}

export default TripTypeSelector
